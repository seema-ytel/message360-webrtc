var widgetController = angular.module("vertoControllers")
    .controller('widgetController', function ($scope, $rootScope, $http, $location, $timeout, $q, verto, storage, $state, ngAudio) {
        //Initialize the widget content
        console.debug("widgetcontroller load");
        $scope.content = {};
        $scope.user = {};
        $scope.errors = {};
        $scope.dialpad = {};
        $scope.authenticatedNumber = false;
        $scope.callData = {};
        function init() {
            $scope.content.showLogin = true;
            $scope.content.showDialer = false;
            $scope.content.showInCall = false;
            $scope.content.incomingCall = false;
        }

        init();
        function clearErrors() {
            $scope.errors = {};
            console.log("errors cleared");
        }

        function checkFunds() {
            console.log('funds url');
            console.log($rootScope.fundsUrl);
            $http.post($rootScope.fundsUrl).then(function (response) {
                if (response.data.Message360.ResponseStatus != 1) {
                    $scope.logout();
                    $scope.errors.fundError = response.data.Message360.Errors.Error.Code + ": " + response.data.Message360.Errors.Error.Message + ".";
                    $rootScope.$broadcast('addError');
                    init();
                } else {
                    $scope.content.showInCall = false;
                    $scope.content.showDialer = true;
                }
            });
        }

        

        $scope.logout = function () {
            var disconnectCallback = function () {
                storage.factoryReset();
            };
            if (verto.data.call) {
                verto.hangup();
            }
            $scope.showReconnect = false;
            verto.disconnect(disconnectCallback);
            verto.hangup();
        };

        $scope.$on('addError', function () {
            $timeout(clearErrors, 4000);
        });

        $scope.authenticateNumber = function () {
            var data = {
                phone_number: $scope.user.cid
            };
            $http.post($rootScope.numberUrl, data).then(function (response) {
                if (response.data.Message360.Errors) {
                    console.log(response.data.Message360);
                    $scope.errors.cidError = response.data.Message360.Errors.Error[0].Code + ": " + response.data.Message360.Errors.Error[0].Message;
                    $rootScope.$broadcast('addError');
                    return $scope.authenticatedNumber = false;
                } else {
                    storage.data.callerIdNumber = $scope.user.cid;
                    return $scope.authenticatedNumber = true;
                }
            });
        };

        $scope.requestToken = function () {
            var connectCallback = function (v, connected) {
                $scope.$apply(function () {
                    verto.data.connecting = false;
                    if (connected) {
                        storage.data.uiConnected = verto.data.connected;
                        storage.data.wsConnected = verto.data.connected;
                        storage.data.firstName = verto.data.first_name;
                        storage.data.lastName = verto.data.last_name;
                        storage.data.countryCode = verto.data.country_code;
                        storage.data.callerIdNumber = verto.data.cid;
                        storage.data.username = verto.data.username;
                        storage.data.webrtcDomain = verto.data.hostname;
                        storage.data.accessToken = verto.data.passwd;
                      //  storage.data.numOfCalls = 0;
                    }
                    if (verto.data.connected == true) {
                        $scope.content.showLogin = false;
                        $scope.content.showDialer = true;
                        console.debug("connected");
                    } else {
                        $scope.errors.serverError = "Error connecting with the server.";
                        $rootScope.$broadcast('addError');
                    }
                });
            };
            var data = {
                phone_number: $scope.user.cid,
                username: $scope.user.username
            };
            $http.post($rootScope.tokenUrl,data).then(function (res) {
                if (res.data.error_message) {
                    $scope.errors.serverError = 'Error establshing a connection, please try again in a few minutes.';
                    $rootScope.$broadcast('addError');
                    return;
                }
                if (res.data.Message360.Errors) {
                    var errorCode = res.data.Message360.Errors.Error[0].Code;
                    var message = res.data.Message360.Errors.Error[0].Message;
                    switch (errorCode) {
                        case 'ER-M360-WRT-107':
                            //$scope.loginErrors.type = 'username';
                            $scope.errors.authError = message;
                            $rootScope.$broadcast('addError');
                            break;
                        case 'ER-M360-WRT-104':
                            $scope.errors.cidError = message;
                            $rootScope.$broadcast('addError');
                        
                        default:
                            $scope.errors.serverError = 'Error establshing a connection, please try again in a few minutes.';
                            $rootScope.$broadcast('addError');
                            break;
                    }
                    $scope.authenticating = false;
                    return;

                }
                var data = res.data.Message360.Message;
                var server_id = data.server_id.toLowerCase();
                console.log("Server id : "+server_id);
                storage.data.currentBalance = data.available_balance;
                verto.data.username = data.username;
                verto.data.cid = data.phone_number;
                verto.data.first_name = data.first_name;
                verto.data.last_name = data.last_name;
                verto.data.name = data.first_name + " " + data.last_name;
                verto.data.passwd = data.access_token;
                verto.data.hostname = data.webrtc_domain;
                verto.data.country_code = data.country_code;
                verto.data.wsURL = 'wss://'+server_id+'.message360.com:8082';

                verto.data.connecting = true;
                verto.data.login = verto.data.cid + "!" + verto.data.username + "@" + verto.data.hostname;
                verto.connect(connectCallback);
            }, function (err) {
                $scope.errors.serverError = 'Error establshing a connection, please try again in a few minutes.';
                $rootScope.$broadcast('addError');
                return;
            });

        };

        //Login functionality
        $scope.login = function () {
            $scope.authenticateNumber();
            $timeout(function() {
                console.log($scope.authenticatedNumber);
                if ($scope.authenticatedNumber == true) {
                    $scope.requestToken();
                } else {
                    return false;
                }
            }, 1000);
        };

        //Dialer functionality
        storage.data.notifications = true;
        storage.data.videoCall = false;
        storage.data.userStatus = 'connecting';
        storage.data.calling = false;

        $scope.call = function () {
            storage.data.currentCall = 0;
            storage.data.onHold = false;
            if (!$scope.dialpad.number) {
                $scope.errors.callError = "Please enter a ten digit number.";
                return false;
            }
            if (verto.data.call) {
                $scope.errors.callError = "There is a call in progress.";
                return false;
            }
            storage.data.mutedVideo = false;
            storage.data.mutedMic = false;
            storage.data.videoCall = false;
            var code = "wrtc";
            var countryCode = "1";
            verto.call(code + countryCode + $scope.dialpad.number);
            storage.data.calledNumber = $scope.dialpad.number;
            console.log(storage.data.calledNumber);
            $scope.content.showDialer = false;
            $scope.content.showInCall = true;
        };

        $scope.dtmf = function (number) {
            if (number == '*') {
                ngAudio.play('src/sounds/dtmf/dtmf-star.mp3');
            } else if (number == '#') {
                ngAudio.play('src/sounds/dtmf/dtmf-hash.mp3');
            } else {
                ngAudio.play('src/sounds/dtmf/dtmf-' + number + '.mp3');
            }
            if ($scope.dialpad.number !== undefined && $scope.dialpad.number !== null) {
                //Added "" just to make sure the number is treated like a string
                $scope.dialpad.number = "" + $scope.dialpad.number + number;
            } else {
                $scope.dialpad.number = "" + number;
            }
        };

        $scope.backspace = function () {
            var number = $scope.dialpad.number;
            var length = number.length;
            $scope.dialpad.number = number.substring(0, length - 1);
        };

        //In call functionality
        $scope.hold = function () {
            storage.data.onHold = !storage.data.onHold;
            verto.data.call.toggleHold();
        };

        $scope.cbMuteMic = function (event, data) {
            storage.data.mutedMic = !storage.data.mutedMic;
        };
        $scope.muteMic = verto.muteMic;

        $scope.hangup = function () {
            $timeout(function () {
                if (!verto.data.call) {
                    return;
                }
                verto.hangup();
            }, 1000);
        };

        $rootScope.dtmfCall = function() {
            ngAudio.play('src/sounds/dtmf/dtmf-star.mp3');
        };

        $scope.timerRunning = false;
        $scope.startTimer = function () {
            $scope.$broadcast('timer-start');
            $scope.timerRunning = true;
        };
        $scope.stopTimer = function () {

            console.log("stopTimer function");
            $scope.$broadcast('timer-stop');
            $scope.timerRunning = false;
        };

        $rootScope.callActive = function (data, params) {
            verto.data.mutedMic = storage.data.mutedMic;
            storage.data.userStatus = "connected";
            $scope.callData.startTime = new Date();
            $timeout(function () {
                $scope.startTimer();
                $scope.incall = true;
            });
            storage.data.calling = false;
            storage.data.currentCall = 1;
        };

        $rootScope.answerCall = function() {
            console.log('into anwsercall');
            storage.data.onHold = false;
            console.log(storage.data);
            verto.data.call.answer({
                useStereo: storage.data.useStereo,
                useCamera: storage.data.selectedVideo,
                useVideo: storage.data.useVideo,
                useMic: storage.data.useMic,
                callee_id_name: verto.data.name,
                callee_id_number: verto.data.login
            });
            console.log('after verto anwsercall');
            $timeout(function() {
                $scope.content.incomingCall = false;
                $scope.callConnected = true;
                $scope.startTimer();
                $scope.incall = true;
            }, 500);
            $scope.content.showInCall=true;
            console.log('last anwsercall');
        };

        $scope.declineCall = function() {
            console.log('into descline');
            $scope.content.incomingCall = false;
            $timeout(function() {
                
                verto.hangup();
                $scope.content.showInCall=true;
            });
        };

        /**
         * Event handlers
         */
        $rootScope.$on("call.hangup", function (event, data) {
            $timeout(function () {
                console.log("Hangup");
                $scope.stopTimer();
            });
            checkFunds();
            $scope.content.incomingCall = false;
            $scope.dialpad.number = "";
            $scope.callConnected = false;
            $scope.content.showInCall=true;
            try {
                $rootScope.$digest();
            } catch (e) {
            }
        });

        $rootScope.$on("call.active", function (event, data, params) {
            $rootScope.callActive(data, params);
        });

        $rootScope.$on("call.calling", function (event, data) {
            storage.data.calling = true;
        });

        $rootScope.$on("call.incoming", function(event, data) {
            console.log('into incomming calls');
            storage.data.currentCall = 0;
            $scope.incomingDid = data;
            console.log($scope.incomingDid);
            $scope.$apply(function() {
                console.log('into incomming calls timeout');
                $scope.content.incomingCall = true;
            });
            storage.data.videoCall = false;
            storage.data.mutedMic = false;
            storage.data.mutedVideo = false;
        });

    });

widgetController.$inject = [
    '$scope',
    '$rootScope',
    '$http',
    '$location',
    '$timeout',
    '$q',
    'verto',
    'storage',
    '$state',
    'ngAudio',
];
