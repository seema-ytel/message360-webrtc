var dialpadController = angular.module("vertoControllers")
    .controller("dialpadController", function ($rootScope, $scope, $http, $state, verto, storage,ngAudio, ngToast) {
        storage.data.notifications = true;
        storage.data.videoCall = false;
        storage.data.userStatus = 'connecting';
        storage.data.calling = false;
        $scope.countryCode = "";

        function checkNumber(countryCode, extension) {

            switch (countryCode) {
                case "US":
                    if ( extension.length === 12 || extension.length === 10 ) {

                        //replacing for webrtc call with extension +1 - user send number with +1
                        extension = extension.replace("+1", "");
                        extension = "wrtc+1" + extension;
                        return extension;
                    } else {
                        return extension = "invalid";
                    }
                    break;
                default:
                    return;
            }
        }

        function call(extension) {
            $scope.stopTimer();
          
            // Check for dialpad number, call, callerIdNumber
            $rootScope.dtmfCall();
            storage.data.currentCall = 0;
            storage.data.onHold = false;
            $rootScope.dialpad.number = extension;
            storage.data.mutedVideo = false;
            storage.data.mutedMic = false;
            storage.data.videoCall = false;
            var numToCall = checkNumber( $rootScope.dialpad.countryCode, extension );

            if ( numToCall === "invalid" ) {
                ngToast.create({
                    className: 'danger',
                    content: "<p class='toast-text'>Dialed number is invalid.</p>",
                    additionalClasses: 'customtoast'
                });
            } else {
                console.log(numToCall);
                verto.call(numToCall);
                $scope.callConnected = true;
                storage.data.calledNumber = extension;
            }
        }

        $scope.loading = false;
        $scope.cancelled = false;

        $scope.call = function (extension) {
           
            $scope.loading = true;
            call(extension);
        };

        $scope.cancel = function () {
            $scope.cancelled = true;
        };
    });
dialpadController.$inject['$rootScope', '$scope', '$http', '$state', 'verto', 'storage','ngAudio','ngToast'];
