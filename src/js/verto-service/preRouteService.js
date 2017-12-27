angular.module("vertoService").service('preRoute', [
    '$rootScope',
    'verto',
    '$state',
    'ngToast',
    function($rootScope, verto, $state, ngToast) {
        /**
             * Event queue functionality? What is this going to be used for..
             */
        var checkVerto = function() {
            var data = localStorage.getItem("token");
            verto.sessid = localStorage.getItem("verto_session_uuid");
            console.debug("Checking if connected to verto.. " + verto.data.connected);
               if(data==0){
                verto.data.connected =false;
                if (!verto.data.connected) {
                    ngToast.create({className: 'info', content: "<p class='toast-text'>Reloading the page disconnects you from verto, please reauthenticate</p>", additionalClasses: 'customtoast'});
                    $state.go("login");
                }
           }
            else{
                   $state.go("dashboard");
            }
        };

        var checkVertoDash = function() {
            var data = localStorage.getItem("token");
            verto.sessid = localStorage.getItem("verto_session_uuid");
            console.debug("Checking if connected to verto.. " + verto.data.connected);
               if(data==0){
                return false;
           }
            else{
                   return true;
            }
        };

        var checkLogin = function() {
            if (verto.data.connected) {
                $state.go('dashboard');
                console.debug("User logged in. Redirecting to dialer.");
            }
        };
        return {"checkVerto": checkVerto, "checkLogin": checkLogin, "checkVertoDash": checkVertoDash};
    }
]);
