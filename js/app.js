

var quizApp = angular.module('quizApp',[]);

//CONTROLLER
quizApp.controller('mainController', function($scope, $http) {

	$scope.questions = [];

	$http.get("model/questions.json")
		.then(function(response) {

			$scope.questions = response.data.questions;

		}, function(response){
			console.log('error');
		});

})

//DIRECTIVES
quizApp.directive('quizQuestion', function ($compile) {

	var trueFalseTemplate = '<li> <div class="question_stem"> <span>Question #</span> <p>{{ question.text }}</p> </div> <div id="answerImg"></div> <ul class="answer_set"> <li class="answer answer1"><span class="enumeration">True</span></li> <li class="answer answer1"><span class="enumeration">False</span></li> </ul> <div class="feedback"> <div class="feedback_text feedback_hint"> <span>Hint</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> <div class="feedback_text feedback_incorrect"> <span>Not Quite</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> <div class="feedback_text feedback_correct"> <span>That\'s Correct!</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> </div> </li>';
	var multiTemplate = '<li> <div class="question_stem"> <span>Question #</span> <p>{{ question.text }}</p> </div> <div id="answerImg"></div> <ul class="answer_set"> <answer ng-repeat="a in question.answers" answer="a"></answer> </ul> <div class="feedback"> <div class="feedback_text feedback_hint"> <span>Hint</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> <div class="feedback_text feedback_incorrect"> <span>Not Quite</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> <div class="feedback_text feedback_correct"> <span>That\'s Correct!</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> </div> </li>';
	
	var getTemplate = function(questionType) {
		var template = '';
		switch (questionType) {
			case 'TorF':
			case 'MC':
				template = multiTemplate;
				console.log(template);
				break;
		}

		return template;
	}

	var linker = function (scope, element, attrs) {

		element.html(getTemplate(scope.question.type));
		$compile(element.contents())(scope);
	}

	return {
		replace: true,
		restrict: "E",
		link: linker,
		scope: {
			question: "="
		}
	}
});

quizApp.directive('checkAnswer', function ($compile){

	return {
		template: '<div class="answer_button disabled">Check Answer</div>'
	}


});

quizApp.directive('answer', function ($compile){

	var type = '';

	
	switch (type) {
		case 'TorF':
			scope.question.correct;
			break;
	}

	var linker = function (scope, element, attrs) {
		//type = scope.question.type;
		//element.html(getQuestionType(scope.question.type));
	}

	return {
		template: '<li class="answer answer1"><span class="enumeration">{{ answer.text }}</span></li>',
		restrict: "E",
		link: linker,
		scope: {
			answer: "="
		}
	}
});
