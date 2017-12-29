var dashboardPanelController = angular.module("vertoControllers").controller("dashboardPanelController", function ($rootScope, $scope, $http, $state, verto, storage, preRoute) {
    'use strict';
    var data = localStorage.getItem("token");
    if(data==0){
        $state.go("login");
    }else{
        $rootScope.regenerateToken();
    }


    $scope.mediaDevices = {
        availableSpeakerDevices: verto.data.speakerDevices,
        availableAudioDevices: verto.data.audioDevices,
        speakerSource: "",
        audioSource: "",
        refreshDevices: function () {
            verto.refreshDevices();
        },
        updateSpeaker: function () {
            if (this.speakerSource !== "") {
                console.log(this.speakerSource);
                storage.data.selectedSpeakerLabel = this.speakerSource.label;
                storage.data.selectedSpeaker = this.speakerSource.id;
                $scope.notifications.setTimeoutNotif('speaker');
            }
        },
        updateAudio: function () {
            if (this.audioSource !== "") {
                console.log(this.audioSource);
                storage.data.selectedAudioLabel = this.audioSource.label;
                storage.data.selectedAudio = this.audioSource.id;
                $scope.notifications.setTimeoutNotif('audio');
            }
        }
    };

    $scope.panelContent = {
        selected: 'callHistory',
        isOpen: true,
        callsid: '',
        changeContent: function (opt) {
            if (opt) {
                this.selected = opt;
            }
        },
        showPopOver: function(call_sid) {
            console.log('into show popover');
            console.log(call_sid);
            console.log(this.isOpen);
            if(this.isOpen == false){
                console.log('into false');
                this.callsid = call_sid;
                this.isOpen = true;    
            }else{
                console.log('into true');
                this.isOpen = false;
                this.callsid = "";
            }
            
        }
    };

});
dashboardPanelController.$inject['$rootScope', '$scope', '$http', '$state', 'verto', 'storage', 'preRoute'];
