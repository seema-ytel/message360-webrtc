var progressController = angular.module('vertoControllers').controller('progressController', function($scope, $rootScope, $interval, $timeout, $window, roundProgressService, loadScreen) {

    $scope.current = loadScreen.progressPercentage;
    $scope.max = 100;
    $scope.offset = 0;
    $scope.timerCurrent = 0;
    $scope.uploadCurrent = 0;
    $scope.stroke = 10;
    $scope.radius = 85;
    $scope.isSemi = false;
    $scope.rounded = false;
    $scope.responsive = false;
    $scope.clockwise = true;
    $scope.currentColor = '#617487';
    $scope.bgColor = '#eaeaea';
    $scope.duration = 800;
    $scope.currentAnimation = 'easeOutCubic';
    $scope.animationDelay = 0;
    $scope.message = '';
    $scope.interruptNext = false;
    $scope.errors = [];

    var checkProgressState = function(currentProgress, status, promise, activity, soft, interruptNext, message) {
        $scope.current = loadScreen.calculate(currentProgress);
        $scope.message = message;

        if (interruptNext && status == 'error') {
            $scope.errors.push(message);
            if (!soft) {
                redirectTo('', activity);
                return;
            } else {
                message = message + '. Continue?';
            }
            if (!confirm(message)) {
                $scope.interruptNext = true;
            }
        }
        if ($scope.interruptNext) {
            return;
        }
        $scope.message = loadScreen.getProgressMessage(currentProgress + 1);
        return true;
    };

    $rootScope.$on('progress.next', function(ev, currentProgress, status, promise, activity, soft, interrupt, message) {
        $timeout(function() {
            if (promise) {
                promise.then(function(response) {
                    message = response['message'];
                    status = response['status'];
                    if (checkProgressState(currentProgress, status, promise, activity, soft, interrupt, message)) {
                        loadScreen.next();
                    }
                });
                return;
            }
            if (!checkProgressState(currentProgress, status, promise, activity, soft, interrupt, message)) {
                return;
            }
            loadScreen.next();
        }, 600);
    });

    $rootScope.$on("progress.complete", function(ev, currentProgress) {
        $scope.message = "Done configuring, going to login.";
        $timeout(function() {
            $scope.$apply(function() {
                $rootScope.progressLoading = false;
            })
        }, 0);
    });

    $scope.increment = function(amount) {
        $scope.current += (amount || 1);
    };

    $scope.decrement = function(amount) {
        $scope.current -= (amount || 1);
    };

    $scope.animations = [];

    angular.forEach(roundProgressService.animations, function(value, key) {
        $scope.animations.push(key);
    });

    $scope.getStyle = function() {
        var transform = ($scope.isSemi
            ? ''
            : 'translateY(-50%) ') + 'translateX(-50%)';

        return {
            'top': $scope.isSemi
                ? 'auto'
                : '50%',
            'bottom': $scope.isSemi
                ? '5%'
                : 'auto',
            'left': '50%',
            'transform': transform,
            '-moz-transform': transform,
            '-webkit-transform': transform,
            'font-size': $scope.radius / 3.5 + 'px'
        };
    };

    $scope.getColor = function() {
        return $scope.gradient
            ? 'url(#gradient)'
            : $scope.currentColor;
    };

    $scope.showPreciseCurrent = function(amount) {
        $timeout(function() {
            if (amount <= 0) {
                $scope.preciseCurrent = $scope.current;
            } else {
                var math = $window.Math;
                $scope.preciseCurrent = math.min(math.round(amount), $scope.max);
            }
        });
    };

    var getPadded = function(val) {
        return val < 10
            ? ('0' + val)
            : val;
    };

    loadScreen.next();

});
progressController.$inject = [
    '$scope',
    '$rootScope',
    '$interval',
    '$timeout',
    '$window',
    'roundProgressService',
    'loadScreen'
];
