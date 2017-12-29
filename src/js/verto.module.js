var app = angular.module("vertoApp", [
    "ngStorage",
    "ui.bootstrap",
    "ngAnimate",
    "ui.router",
    "vertoControllers",
    'pascalprecht.translate',
    'timer',
    'ngToast',
    'ngAudio',
    'ngCookies',
    'angularMoment'
]);

app.config(function($stateProvider, $urlRouterProvider, $translateProvider) {
    $stateProvider.state("login", {
        url: "/",
        templateUrl: "src/views/pages/login.html",
        controller: "loginController",
        title: "Welcome!"
    }).state("dashboard", {
        url: "/dashboard",
        templateUrl: "src/views/pages/dashboard.html",
        title: "Dashboard"
    });
    $urlRouterProvider.otherwise("/");
    $translateProvider.preferredLanguage('en').determinePreferredLanguage().fallbackLanguage('en').useSanitizeValueStrategy(null);
});

app.config([
    'ngToastProvider',
    function(ngToastProvider) {
        ngToastProvider.configure({animation: 'slide'});
    }
]);

/**
 * Customer filter to display formatted phone number
 * Returns a modified string
 */
// app.filter("phoneFilter", function() {

//     return function(tel) {
//         if (!tel) {
//             return '';
//         }

//         var value = tel.toString().trim().replace(/^\+/, '');

//         if (value.match(/[^0-9]/)) {
//             return tel;
//         }

//         var country,
//             city,
//             number;

//         switch (value.length) {
//             case 10: // +1PPP####### -> C (PPP) ###-####
//                 country = 1;
//                 city = value.slice(0, 3);
//                 number = value.slice(3);
//                 break;

//             case 11: // +CPPP####### -> CCC (PP) ###-####
//                 country = value[0];
//                 city = value.slice(1, 4);
//                 number = value.slice(4);
//                 break;

//             case 12: // +CCCPP####### -> CCC (PP) ###-####
//                 country = value.slice(0, 3);
//                 city = value.slice(3, 5);
//                 number = value.slice(5);
//                 break;

//             default:
//                 return tel;
//         }

//         number = number.slice(0, 3) + '-' + number.slice(3);

//         return (country + " (" + city + ") " + number).trim();
//     };
// });

app.run(function($rootScope, $http, ngToast) {
    $http.get('urlConfig.json').then(function(response) {
        var loginUrl = response.data.login_url;
        var fundsUrl = response.data.funds_url;
        var numberUrl = response.data.number_url;
        var tokenUrl = response.data.token_url;
        var logsUrl = response.data.logs_url;
        var phoneNumberListUrl = response.data.phone_number_list_url;
        var tokenUrlNumberChange = response.data.token_url_number_change;

        if (loginUrl !== "") {
            $rootScope.loginUrl = loginUrl;
        } else {
            ngToast.create({className: 'danger', content: "<p class='toast-text'>Login URL configuration invalid. Please check your configuration settings or have a look at documentation for more help.</p>"});
        }
        if (fundsUrl !== "") {
            $rootScope.fundsUrl = fundsUrl;
        } else {
            ngToast.create({className: 'danger', content: "<p class='toast-text'>Funds URL configuration invalid. Please check your configuration settings or have a look at documentation for more help.</p>"});
        }

        if (numberUrl !== "") {
            $rootScope.numberUrl = numberUrl;
        } else {
            ngToast.create({className: 'danger', content: "<p class='toast-text'>Number URL configuration invalid. Please check your configuration settings or have a look at documentation for more help.</p>"});
        }

        if (tokenUrl !== "") {
            $rootScope.tokenUrl = tokenUrl;
        } else {
            ngToast.create({className: 'danger', content: "<p class='toast-text'>Token URL configuration invalid. Please check your configuration settings or have a look at documentation for more help.</p>"});
        }

        if (logsUrl !== "") {
            $rootScope.logsUrl = logsUrl;
        } else {
            ngToast.create({className: 'danger', content: "<p class='toast-text'>Logs URL configuration invalid. Please check your configuration settings or have a look at documentation for more help.</p>"});
        }
        if (tokenUrlNumberChange !== "") {
            $rootScope.tokenUrlNumberChange = tokenUrlNumberChange;
        } else {
            ngToast.create({className: 'danger', content: "<p class='toast-text'>Token URL configuration invalid. Please check your configuration settings or have a look at documentation for more help.</p>"});
        }
        if (phoneNumberListUrl !== "") {
            $rootScope.phoneNumberListUrl = phoneNumberListUrl;
        } else {
            ngToast.create({className: 'danger', content: "<p class='toast-text'>Webrct override url configuration invalid. Please check your configuration settings or have a look at documentation for more help.</p>"});
        }

    }, function(error) {
        ngToast.create({className: 'danger', content: "<p class='toast-text'> Configuration file not found. Please check your configuration settings or have a look at documentation for more help.</p>"});
    });

    window.onbeforeunload = function(e) {
        window.location.ref = "/";
    };
});
