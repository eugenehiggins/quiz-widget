

var quizApp = angular.module('quizApp',[]);

//SERVICES

quizApp.service('QuestionService', function($http) {
	console.log("service starts");

	var self = this

	var currentQuestionId = 0;
	var questions = [];

	self.getData = function() {
		return $http.get("model/questions.json");

	}

	self.getCurrentQuestionId = function (){
		return self.currentQuestionId;
	}

	self.getQuestions = function () {
		return self.questions;
	}

	self.getQuestion = function() {
		return self.questions[self.currentQuestionId];
	}

	
});



//DIRECTIVES
quizApp.directive('quizQuestion', function ($compile, QuestionService) {

	var qs = QuestionService;
	
	

	var linker = function (scope, element, attrs) {
		scope.$on("Data_Ready", function(e){

			var question = QuestionService.getQuestion();

			var trueFalseTemplate = '<li> <div class="question_stem"> <span>Question #</span> <p>{{ question.text }}</p> </div> <div id="answerImg"></div> <ul class="answer_set"> <li class="answer answer1"><span class="enumeration">True</span></li> <li class="answer answer1"><span class="enumeration">False</span></li> </ul> <div class="feedback"> <div class="feedback_text feedback_hint"> <span>Hint</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> <div class="feedback_text feedback_incorrect"> <span>Not Quite</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> <div class="feedback_text feedback_correct"> <span>That\'s Correct!</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> </div> </li>';
			var multiTemplate = '<li id="question-' + QuestionService.getCurrentQuestionId() + '"> <div class="question_stem"> <span>Question #</span> <p>' + question.text +'</p> </div> <div id="answerImg"></div> <ul class="answer_set"> <answer ng-model="question" ng-repeat="(key, value) in question.answers" answer="value" key="key"></answer> </ul> <div class="feedback"> <div class="feedback_text feedback_hint"> <span>Hint</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> <div class="feedback_text feedback_incorrect"> <span>Not Quite</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> <div class="feedback_text feedback_correct"> <span>That\'s Correct!</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> </div> </li>';
			
			var getTemplate = function(questionType) {
				var template = '';
				switch (questionType) {
					case 'TorF':
					case 'MC':
						template = multiTemplate;

						break;
				}

				return template;
			}

			
			console.log(element);
			element.html(getTemplate(question.type));
			$compile(element.contents())(scope);
			
		})
		
		
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

quizApp.directive('checkAnswer', function ($compile, QuestionService){

	var qIndex = '';

	var getQuestionIndex = function() {
		var activeElement = $('.user_select');
		i = activeElement.attr('id').split("-")[1];
		return i;
	}

	var linker = function (scpe, element, attrs){
		element.on('click', function(e) {
						
			qIndex = getQuestionIndex();
			qs = QuestionService;
			if(qs.questions[qs.currentQuestion].answers[qIndex].correct === "true"){
				console.log ("correct");
			} else {
				console.log("incorrect");
			}
			

		});
	}

	return {
		link: linker,
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
		
		element.on('click', function(e) {
			$('.answer_button').removeClass('disabled').addClass('active');
			element.addClass('user_select');
			element.siblings().removeClass('user_select');
			$compile(element.contents())(scope);
		});
		
		//element.html(getQuestionType(scope.question.type));
	}

	return {
		replace: true,
		restrict: "E",
		template: '<li class="answer answer-{{ key }}" id="answer-{{ key }}"><span class="enumeration">{{ answer.text }}</span></li>',
		link: linker,
		scope: {
			answer: "=",
			key: "="
		}
	}
});

//CONTROLLER
quizApp.controller('mainController', function($scope, QuestionService, $http) {
	var self = this;

	var questions = [];

	var qs = QuestionService;

	console.log('controller runs');

	var fetchQuestions = function () {
		QuestionService.getData().
		//$http.get("model/questions.json").
		then(function (result) {
			QuestionService.questions = result.data.questions;
			
			//console.log('scope question set');
			QuestionService.currentQuestionId = 0;
			
			$scope.$broadcast("Data_Ready");
			$scope.question = QuestionService.getQuestion();
			console.log($scope.question);
			
		}, function (result) {
			console.log("error: " + result);
		});
	};

	 fetchQuestions();

})
