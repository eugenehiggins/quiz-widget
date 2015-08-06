

var myApp = angular.module('myApp',[]);

myApp.controller('mainController', function($scope, $http) {

	
	
	$http.get("model/questions.json").
	then(function(response) {
		//console.log(response.data.questions);
		$scope.questions = response.data.questions;
		//init();
		angular.element($("#q1").addClass("active"));
	}, function(response){
		console.log('error');
	});

})

function init() {
	console.log($("#q1").html());
	
}

$(document).ready( function () {
		
		//$("#q1").setClass("active").siblings().setClass("inactive");
		//$("#q1").css("display","none");
});

