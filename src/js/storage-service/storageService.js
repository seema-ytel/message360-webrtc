angular.module("storageService").service('storage', ['$rootScope', '$localStorage',
 function($rootScope, $localStorage) {
     //Declare the storage data and then the default settings we're going to use in the application.
     var data = $localStorage, defaultSettings = {
         uiConnected : false,
         wsConnected : false,
         currentCall : 0,
         calledNumber : '',
         useVideo : true,
         callHistory : [],
         callStart : false,
         name : null,
         login : "",
         accessToken : "",
         callerIdNumber : null,
         userStatus : 'disconnected',
         mutedVideo : true,
         mutedMic : false,
         preview : true,
         selectedVideo : null,
         selectedVideoLabel : null,
         selectedAudio : null,
         selectedAudioLabel : null,
         selectedShare : null,
         selectedSpeaker : null,
         selectedSpeakerLabel : null,
         useStereo : true,
         useSTUN : true,
         useDedenc : false,
         mirrorInput : false,
         outgoingBandwidth : 'default',
         incomingBandwidth : 'default',
         vidQual : undefined,
         askRecoverCall : false,
         googNoiseSuppression : true,
         googHighpassFilter : true,
         googEchoCancellation : true,
         autoBand : true,
         bestFrameRate : "30",
         numOfCalls : 0
     };

     data.$default(defaultSettings);

     function changeData(verto_data) {
         jQuery.extend(true, data, verto_data);
     }

     return {
         data : data,
         changeData : changeData,
         reset : function () {
             data.ui_connected = false;
             data.ws_connected = false;
             data.cur_call = 0;
             data.userStatus = 'disconnected';
         },
         factoryReset : function () {
             $localStorage.$reset();
             //Reset back to default settings
             data.$reset(defaultSettings);
         }
     }
 }]);