var mainController = angular.module("vertoControllers").controller("mainController", function($scope, $rootScope, $http, $location, $timeout, $q, verto, storage, $state, ngToast, callHistory, ngAudio, $uibModal) {
    if (storage.data.language && storage.data.language !== 'browse') {
        storage.data.language = 'browser';
    }

    $scope.verto = verto;
    $scope.storage = storage;
    $scope.showReconnect = true;
    $rootScope.progressLoading = true;
    $rootScope.dialpad = {
        number: "",
        countryCode: "US"
    };
    $scope.callHistory = [];
    $scope.user = {};
    $scope.timerRunning = false;
    $scope.incomingDid = "";
    $scope.callData = {};
    $scope.authenticating = false;
    $scope.webrtcOverrideNumbers = [];

    $scope.loginErrors = {
        type: "",
        message: "",
        fieldSpecificMessage: "",
        setErrors: function(type, message) {
            this.type = type;
            this.message = message;
        },
        setTimeoutErrors: function(type, message) {
            $scope.authenticating = false;
            this.type = type;
            this.message = message;
            $timeout(function() {
                $scope.loginErrors.type = "";
                $scope.loginErrors.message = "";
                $scope.loginErrors.fieldSpecificMessage = "";
            }, 4000);
            $scope.authenticating = false;
        },
        clearErrors: function(type) {
            if (type) {
                switch (type) {
                    case 'username':
                        if ($scope.loginErrors.type === 'username') {
                            $scope.loginErrors.message = "";
                            $scope.loginErrors.fieldSpecificMessage = "";
                            $scope.loginErrors.type = "";
                        }
                        break;
                    case 'password':
                        if ($scope.loginErrors.password !== null) {
                            $scope.loginErrors.message = "";
                            $scope.loginErrors.fieldSpecificMessage = "";
                            $scope.loginErrors.type = "";
                        }
                        break;
                    default:
                        return;
                }
            }
        }
    };

    // For todays date;
    Date.prototype.today = function() {
        return ((this.getDate() < 10)
            ? "0"
            : "") + this.getDate() + "/" + (((this.getMonth() + 1) < 10)
            ? "0"
            : "") + (this.getMonth() + 1) + "/" + this.getFullYear();
    };

    // For the time now
    Date.prototype.timeNow = function() {
        return ((this.getHours() < 10)
            ? "0"
            : "") + this.getHours() + ":" + ((this.getMinutes() < 10)
            ? "0"
            : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10)
            ? "0"
            : "") + this.getSeconds();
    };

    $scope.notifications = {
        speakerUpdated: false,
        audioUpdated: false,
        updateMessage: "",
        setTimeoutNotif: function(val) {
            this.clearNotifs();
            if (val === 'speaker') {
                this.speakerUpdated = true;
            }
            if (val === 'audio') {
                this.audioUpdated = true;
            }
            this.updateMessage = "Successfully Updated.";
            $timeout(function() {
                $scope.notifications.speakerUpdated = false;
                $scope.notifications.audioUpdated = false;
            }, 2000);
        },
        clearNotifs: function() {
            this.speakerUpdated = false;
            this.audioUpdated = false;
            this.updateMessage = false;
        }
    };

    function checkFunds() {
        try {
            var url = $rootScope.fundsUrl;
            $http.post(url).then(function(response) {
                console.log(response);
                if (!response.data || !response.data.Message360 ||  response.data.Message360.ResponseStatus !== 1) {
                    $scope.logout();
                    ngToast.create({
                        className: 'danger',
                        content: "<p class='toast-text'>"+response.data.Message360.Errors.Error[0].Code + ": " + response.data.Message360.Errors.Error[0].Message + "</p>",
                        additionalClasses: 'customtoast'
                    });
                }
            });
        }
        catch(err) {
            $scope.logout();
            ngToast.create({
                className: 'danger',
                content: "<p class='toast-text'>"+response.data.Message360.Errors.Error[0].Code + ": " + response.data.Message360.Errors.Error[0].Message + "</p>",
                additionalClasses: 'customtoast'
            });
        }
    }

    function getLogs() {
        try {
            var url = $rootScope.logsUrl;

            var data = {
                username: $scope.user.username
            };
            console.log('into call logs');
            console.log(data);

            $http.post(url,data).then(function(response) {
                console.log(response);
                
                if (!response.data || !response.data.Message360 ||  response.data.Message360.ResponseStatus !== 1) {
                    $scope.logout();
                    ngToast.create({
                        className: 'danger',
                        content: "<p class='toast-text'>"+response.data.Message360.Errors.Error[0].Code + ": " + response.data.Message360.Errors.Error[0].Message + "</p>",
                        additionalClasses: 'customtoast'
                    });
                }else{


                    var data = response.data.Message360.WebRtcCall;
                    callHistory.clear();

                    console.log("into seemaa seema");

                    var log = [];
                    angular.forEach(data, function(value, key) {
                        $scope.callData = {};
                        $scope.callData = {
                            num: value.called_number,
                            callerIdNumber: value.called_number,
                            calltype:value.direction,
                            date: value.start_date,
                            time: value.start_time,
                             callsid : value.call_sid
                        };
                        console.log($scope.callData)

                        callHistory.add($scope.callData);
                    });
                    console.log("count : "+response.data.Message360.count);
                    storage.data.numOfCalls =response.data.Message360.count;

                    console.log("storage count : "+storage.data.numOfCalls);
                    $scope.callHistory = storage.data.callHistory;
                }
            });
        }
        catch(err) {
            $scope.logout();
            ngToast.create({
                className: 'danger',
                content: "<p class='toast-text'>"+response.data.Message360.Errors.Error[0].Code + ": " + response.data.Message360.Errors.Error[0].Message + "</p>",
                additionalClasses: 'customtoast'
            });
        }
    }

    function getWebrtcOverrideNumbers() {
        try {
            var url = $rootScope.phoneNumberListUrl;

            console.log(url);
            var data = {username :  $scope.user.username}
            $http.post(url,data).then(function(response) {
                console.log('into get webrtc-override numbers');
                console.log(response);
                if (!response.data || !response.data.Message360 ||  response.data.Message360.ResponseStatus !== 1) {
                    $scope.logout();
                    ngToast.create({
                        className: 'danger',
                        content: "<p class='toast-text'>"+response.data.Message360.Errors.Error[0].Code + ": " + response.data.Message360.Errors.Error[0].Message + "</p>",
                        additionalClasses: 'customtoast'
                    });
                }else{
                    var data = response.data.Message360.Phones.Phone;
                    var log = [];
                    var webrtcOverridePhone = [];
                    angular.forEach(data, function(value, key) {
                        $scope.webrtcOverridePhone = {};
                        webrtcOverridePhone.push(value.phone_number);
                    });
                    $scope.webrtcOverrideNumbers = webrtcOverridePhone;
                    console.log('into data aaaaa');
                    console.log($scope.webrtcOverrideNumbers)
                }
            });
        }
        catch(err) {
            $scope.logout();
            ngToast.create({
                className: 'danger',
                content: "<p class='toast-text'>"+response.data.Message360.Errors.Error[0].Code + ": " + response.data.Message360.Errors.Error[0].Message + "</p>",
                additionalClasses: 'customtoast'
            });
        }
    }


    $scope.startTimer = function() {
        $scope.$broadcast('timer-start');
        $scope.timerRunning = true;
    };

    $scope.stopTimer = function() {
        console.log("stopTimer function");
        $scope.$broadcast('timer-stop');
        $scope.timerRunning = false;
    };
    $scope.stopTimer = function() {
        console.log("reset function");
        $scope.$broadcast('timer-reset');
        $scope.timerRunning = false;
    };

    $scope.resumeTimer = function() {
        console.log('resume timer function');
      $scope.$broadcast('timer-resume');
      $scope.timerRunning = true;
    }

    $rootScope.regenerateToken = function(){
        $scope.login();
    };

    /**
     * Request to server for accessToken
     **/
    $scope.login = function() {
        console.log('login')
        $scope.authenticating = true;
        var connectCallback = function(v, connected) {
            console.log('into callback function');
            $scope.$apply(function() {
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
                   // storage.data.numOfCalls = 0;
                    callHistory.clear();
                }
                if (verto.data.connected) {
                    console.log('connected to server');
                    localStorage.setItem("token","1");
                    verto.SaveState();
                    $state.go("dashboard");
                    $scope.authenticating = false;
                } else {
                    $scope.loginErrors.setTimeoutErrors('server', "Trouble connecting to the server, please try again.");
                    $scope.authenticating = false;
                }
            });
        };
        var data = localStorage.getItem("token");
        console.log(data);
        if(data>0){
            console.log($rootScope.tokenUrl);
            var restoredData = verto.RestoreState();
            console.log(restoreData);
            var data = {
                phone_number: storage.data.callerIdNumber,
                username: restoreData.username,
            };
            $scope.user.username = restoreData.username;
             var url = $rootScope.tokenUrlNumberChange;
            console.log(data);
            $http.post(url,data).then(function (res) {
                if (res.data.error_message) {
                    $scope.loginErrors.setTimeoutErrors('default', 'Error establishing a connection, please try again in a few minutes.');
                    return;
                }
                if (res.data.Message360.Errors) {
                    verto.data.connected =false;
                    if (!verto.data.connected) {
                        ngToast.create({className: 'info', content: "<p class='toast-text'>Not able to reconnect server. Please login to continue.</p>", additionalClasses: 'customtoast'});
                        $rootScope.logout();
                    }
                    $scope.authenticating = false;
                    return;

                }
                console.log(res.data);
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
                getWebrtcOverrideNumbers();
                 getLogs();
            }, function (err) {
                console.error(err);
            });
            return;
        }else{

            if(!$scope.user.username){
                $scope.loginErrors.type = 'username';
                $scope.loginErrors.fieldSpecificMessage = 'Username is required.';
                $scope.authenticating = false;
                $scope.isOpenUsername = false;
                return;
            }

            if(!$scope.user.password){
                $scope.loginErrors.type = 'password';
                $scope.loginErrors.fieldSpecificMessage = 'Password is required.';
                $scope.authenticating = false;
                $scope.isOpenPassword = false;
                return;
            }

            var data = {
                username: $scope.user.username,
                password: $scope.user.password
            };

            var url = $rootScope.loginUrl;

            $http.post(url, data).then(function(res) {
                console.log(res);
                if (res.data.error_message || !res.data.Message360 || !res.data) {
                    $scope.loginErrors.setTimeoutErrors('default', 'Error establishing a connection, please try again in a few minutes.');
                    return;
                }
                if (res.data.Message360.Errors) {
                    var errorCode = res.data.Message360.Errors.Error[0].Code;
                    var message = res.data.Message360.Errors.Error[0].Message;
                    switch (errorCode) {
                        case 'ER-M360-WRT-107':
                            $scope.loginErrors.type = 'username';
                            $scope.loginErrors.fieldSpecificMessage = message;
                            break;
                        case 'ER-M360-WRT-108':
                            $scope.loginErrors.type = 'password';
                             $scope.loginErrors.fieldSpecificMessage = message;
                            break;
                        case 'ER-M360-WRT-109':
                             $scope.loginErrors.setTimeoutErrors('default', message);
                            break;
                        case 'ER-M360-WRT-110':
                            $scope.loginErrors.setTimeoutErrors('default', message);
                            break;
                        case 'ER-M360-WRT-111':
                            $scope.loginErrors.type = 'username';
                            $scope.loginErrors.fieldSpecificMessage = message;
                            break;
                        case 'ER-M360-WRT-112':
                            $scope.loginErrors.type = 'password';
                            $scope.loginErrors.fieldSpecificMessage = message;
                            break;
                        default:
                            $scope.loginErrors.setTimeoutErrors('default', 'Error establshing a connection, please try again in a few minutes.');
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
                $scope.authenticating = false;
                getLogs();
                getWebrtcOverrideNumbers();
            }, function(err) {
                $scope.loginErrors.setTimeoutErrors('config', 'Configuration for this account is either not complete or invalid, please check and try again.');
            });
        }
        
    };

    //Logout the user from the server and redirect to login page.
    $rootScope.logout = function() {
        localStorage.setItem("token","0");
        var disconnectCallback = function() {
            storage.factoryReset();
        };
        if (verto.data.call) {
            verto.hangup();
        }
        $scope.showReconnect = false;
        verto.disconnect(disconnectCallback);
        $state.go("login");
       // window.location.href = "https://webrtc-preprod.ytel.com";
    };

    $rootScope.backspace = function() {
        var number = $rootScope.dialpad.number;
        var length = number.length;
        $rootScope.dialpad.number = number.substring(0, length - 1);
    };

    /**
     * Updates the display adding the number pressed.
     *
     * @param {String} number - Number touched on dialer.
     */
    $rootScope.dtmf = function(number) {
        if (number === '*') {
            ngAudio.play('src/sounds/dtmf/dtmf-star.mp3');
        } else if (number === '#') {
            ngAudio.play('src/sounds/dtmf/dtmf-hash.mp3');
        } else {
            ngAudio.play('src/sounds/dtmf/dtmf-' + number + '.mp3');
        }
        if ($rootScope.dialpad.number !== undefined && $rootScope.dialpad.number !== null) {
            //Added "" just to make sure the number is treated like a string
            $rootScope.dialpad.number = "" + $rootScope.dialpad.number + number;
        } else {
            $rootScope.dialpad.number = "" + number;
        }
    };

    $rootScope.dtmfCall = function() {
        ngAudio.play('src/sounds/dtmf/dtmf-star.mp3');
    };

    $rootScope.callActive = function(data, params) {
        console.log(data, params);
        verto.data.mutedMic = storage.data.mutedMic;
        storage.data.userStatus = "connected";
        $scope.callData.startTime = new Date();
        console.log('in to call active in main controller');
        if(storage.data.currentCall===1){
            console.log('in cnd resume');
           $timeout(function() {
               $scope.resumeTimer();
                $scope.incall = true;
            });
        }else{
            console.log('in cnd start');
            $timeout(function() {
                $scope.startTimer();
                $scope.incall = true;
            });
        }
        
        storage.data.calling = false;
        storage.data.currentCall = 1;
    };

    /**
     * Event handlers
     */
    $rootScope.$on("call.hangup", function(event, data) {
        
        console.log(event, data);
        $scope.callConnected = false;
        $timeout(function() {
            $scope.resetTimer();
        });
         $timeout(function() {
               $scope.incomingCall = false;
            });

        $scope.incall = false;
        storage.data.numOfCalls += 1;
        $rootScope.dialpad.number = "";
        console.log('into on hangup');
        console.log(storage.data);
        var now = new Date();
        // $scope.callData = {
        //     num: storage.data.calledNumber,
        //     callerIdNumber: storage.data.callerIdNumber,
        //     calltype:storage.data.calltype,
        //     date: now.today(),
        //     time: now.timeNow()
        // };
        // callHistory.add($scope.callData);
        // $scope.callHistory = storage.data.callHistory;
        //$scope.callData = {};
        getLogs();
        checkFunds();
        try {
            $rootScope.$digest();
        } catch (e) {}
    });

    $rootScope.$on("call.active", function(event, data, params) {
        $rootScope.callActive(data, params);
    });

    $rootScope.$on("call.calling", function(event, data) {
       console.log(event, data);
        storage.data.calling = true;
    });

    $rootScope.$on("call.incoming", function(event, data) {
        console.log('into on hangup');
        console.log(event);
        console.log('data');
        console.log(data);
        // storage.data.callerIdNumber = data;
        console.log('assign caller id');
        storage.data.currentCall = 0;
        $scope.incomingDid = data;
        $scope.$apply(function() {
            $scope.incomingCall = true;
        });
        storage.data.videoCall = false;
        storage.data.mutedMic = false;
        storage.data.mutedVideo = false;
    });

    $rootScope.answerCall = function() {
        storage.data.onHold = false;
        verto.data.call.answer({
            useStereo: storage.data.useStereo,
            useCamera: storage.data.selectedVideo,
            useVideo: storage.data.useVideo,
            useMic: storage.data.useMic,
            callee_id_name: verto.data.name,
            callee_id_number: verto.data.login
        });
        $timeout(function() {
            $scope.incomingCall = false;
            $scope.callConnected = true;
        }, 500);
    };

    $scope.declineCall = function() {
        $timeout(function() {
            verto.hangup();
            $scope.incomingCall = false;
        });
    };

    $scope.changeFromNumber = function() {
        console.log(storage.data.callerIdNumber);
        $scope.login();
    };


    $scope.hangup = function() {
        
        $scope.callConnected = false;
        $timeout(function() {
            if (!verto.data.call) {
                return false;
            } else {
                verto.hangup();
            }
        }, 1500);
    };

    $scope.hold = function() {
        console.log('into hold')
        storage.data.onHold = !storage.data.onHold;
        console.log(storage.data.onHold);
        verto.data.call.toggleHold();
    };

    $scope.cbMuteMic = function(event, data) {
        console.log(event,data);
        storage.data.mutedMic = !storage.data.mutedMic;
    };
    $scope.muteMic = verto.muteMic;

    /**
     * Handling multiple websockets errors.
     */
    $rootScope.$on('ws.close', onWSClose);
    $rootScope.$on('ws.login', onWSLogin);

    var wsInstance;

    function onWSClose(event, data) {
        console.log(event,data);
        if (wsInstance) {
            return false;
        }
        var options = {
            backdrop: 'static',
            keyboard: false
        };
        if (verto.data.call) {
            verto.hangup();
        }
    }

    function onWSLogin(event, data) {
        if (!wsInstance) {
            return false;
        }
        wsInstance.close();
        wsInstance = null;
    }

    $scope.quickCall = function(extension) {
        if ( !verto.data.call ) {
            var toCall = 'wrtc' + extension;
            storage.data.currentCall = 0;
            storage.data.onHold = false;
            storage.data.mutedVideo = false;
            storage.data.mutedMic = false;
            storage.data.videoCall = false;
            verto.call(toCall);
            storage.data.calledNumber = extension;
        } else {
            ngToast.create({
                className: 'danger',
                content: "<p class='toast-text'>A call is already in progress.</p>",
                additionalClasses: 'customtoast'
            });
        }
    };

    $scope.quickCallNumber = function(number_call) {   
    $("#dialpadNumber").css("color","");
       
       $scope.dialpad.number=number_call;
    };


});
mainController.$inject = [
    '$scope',
    '$rootScope',
    '$http',
    '$location',
    '$timeout',
    '$q',
    'verto',
    'storage',
    '$state',
    'ngToast',
    'callHistory',
    'ngAudio',
    '$uibModal'
];
