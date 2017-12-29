var loginController = angular.module("vertoControllers").controller("loginController", function(preRoute,$rootScope,$state,$scope) {
	//reseting all data
    $scope.authenticating = false;
    $scope.user.password = "";
    $scope.user.username = "";


    var data = localStorage.getItem("token");
    if(data==0){
        console.log("0");
        $state.go("login");
    }else{
        $rootScope.regenerateToken();
    }
    preRoute.checkLogin();
});

loginController.$inject = ['preRoute','$rootScope','$state','$scope'];
