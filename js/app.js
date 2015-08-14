

var quizApp = angular.module('quizApp',[]);

//SERVICES

quizApp.service('QuestionService', ['$http','AnswerService', '$rootScope', function($http, AnswerService, $rootScope) {

	var self = this

	self.currentQuestionId = 0;
	self.questions = [];
	self.q = []
	self.score = 0;
	self.quizDone = false;

	self.setQuizDone = function () {
		self.quizDone = true;
	}

	self.incrementScore = function(){
		self.score++;
	}

	self.getData = function() {
		return $http.get("model/quizTest.json");

	}

	self.getCurrentQuestionId = function (){
		return self.currentQuestionId;
	}

	self.getQuestions = function () {
		return self.questions;
	}

	self.getQuestion = function() {
		if(self.quizDone == false){
			self.q = self.questions[self.currentQuestionId];
			return self.q;
		} else {
			return {
				"type": "DONE",
				"score": self.score
			}
		}
	}

	self.getNextQuestion = function () {
		
		self.currentQuestionId += 1;
		//AnswerService.setCurrentAnswer = '';
		$rootScope.$broadcast('qId:changed')
		return self.getQuestion();

	}

	self.resetQuestions = function () {

		self.currentQuestionId = 0;
		self.score = 0;
		self.quizDone = false;
		$rootScope.$broadcast('qId:changed');
		return self.getQuestion();
	};
	
}]);

quizApp.service('AnswerService', function() {
	var self = this;

	var currentAnswer = '';
	

	self.setCurrentAnswer = function (element) {
		currentAnswer = element;
	}

	self.getCurrentAnswer = function (element) {
		return currentAnswer;
	}
})

//DIRECTIVES
quizApp.directive('quizQuestion', function ($compile, QuestionService, $rootScope) {

	var qs = QuestionService;

	var linker = function (scope, element, attrs) {
		scope.$on("Data_Ready", function(e){
			$rootScope.$broadcast('compile_answer');
			scope.question = QuestionService.getQuestion();
			
			var multiTemplate = '<div class="question_stem" ng-model="question"> <span>Question #</span> <p>' + scope.question.text+' </p> </div> <div id="answerImg"></div> <ul class="answer_set"> <answer ng-model="question" ng-repeat="(key, value) in question.answers" answer="value" key="key"></answer> </ul> <div class="feedback"> <div class="feedback_text feedback_hint"> <span>Hint</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> <div class="feedback_text feedback_incorrect"> <span>Not Quite</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> <div class="feedback_text feedback_correct">' + scope.question.feedbackCorrect +' </div> </div> <div class="interactions"> <check-answer></check-answer> <next-question></next-question></div>';
			var scoreTemplate = '<div class="question_stem" ng-model="question"> You are done! Your score is ' + scope.question.score + ' </div><try-again></try-again>';


			var getTemplate = function(questionType) {
				var template = '';
				switch (questionType) {
					case 'TorF':
					case 'MC':
						template = multiTemplate;
						break;
					case 'DONE':
						template = scoreTemplate;
						$('#try_again_button').show().addClass('active');
						break;
				}

				return template;
			}

			element.html(getTemplate(scope.question.type));
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

quizApp.directive('checkAnswer', function ($compile, QuestionService, AnswerService){

	var qIndex = '';

	var getQuestionIndex = function() {

		var activeElement = $('.user_select');
		i = activeElement.attr('id').split("-")[1];
		return i;
	}

	var linker = function (scope, element, attrs){
		var answerButton = element.children('#answer_button');

			element.on('click', function(e) {

				if($(answerButton).text() === 'Reset Question') {
					// do reset stuff
					$('.answer').removeClass('correct correct_answer incorrect user_select');
					$('.feedback_text').slideUp();
					$('#answer_button').text('Check Answer').addClass('disabled').removeClass('reset active');
					$('#next_button').hide();
				} else {

					qIndex = getQuestionIndex();
					
					qs = QuestionService;
					as = AnswerService;

					$('.answer').addClass('disabled');
					$('.answer').off('click');
				
					if($(".active")[0] && qs.getQuestion().answers[qIndex].correct === "true"){
						
						// THE ANSWER IS CORRECT
						$('#answer_button').hide();
						$('body').off('click', '.answer');
						$('.user_select')
							.addClass('correct correct_answer')
							.siblings().removeClass('incorrect');
						$('.feedback .feedback_text').css("border-bottom" , "1px dotted #d3d3d3");
						$('.feedback .feedback_correct span').css({
							"color" : "#66ae3d",
						    "display" : "inline-block",
						    "margin-bottom" : "5px"
						});
						$('.feedback_incorrect').slideUp();
						$('.feedback_correct').slideDown();
						//$('#answer_button').text('Reset Question').addClass('reset');

						// update the score
						qs.incrementScore();

						$('#next_button')
							.addClass('active')
							.show();

					} else {
						console.log("incorrect");
						$('.user_select').addClass('incorrect');
						$('.feedback .feedback_incorrect span').css({
							"color" : "#e33826",
						    "display" : "inline-block",
						    "margin-bottom" : "5px",
						    "overflow" : "hidden"
						});
						$('.feedback_incorrect').slideDown();
						$('#answer_button').hide().removeClass('active');
						$('#next_button').addClass('active').show();
					}
				}	

			});
	}

	return {
		link: linker,
		template: '<div class="answer_button disabled" id="answer_button">Check Answer</div>'
	}


});

quizApp.directive('nextQuestion', function ($compile, QuestionService, AnswerService){

	var linker = function (scope, element, attrs) {
		var qs = QuestionService;

		$('#next_button').hide();
		
		element.on('click', function(){
			if (qs.getCurrentQuestionId() + 1 < qs.getQuestions().length) {
				
			} else {
				qs.setQuizDone();
			}
			scope.question = qs.getNextQuestion();

		});
	}

	return {
		link: linker,
		template: '<div class="answer_button" id="next_button">Next Question</div>'
	}
});

quizApp.directive('tryAgain', function ($compile, QuestionService, AnswerService){

	var linker = function (scope, element, attrs) {
		var qs = QuestionService;

		//$('#try_again_button').hide();
		
		element.on('click', function(){
			scope.question = qs.resetQuestions();

		});
	}

	return {
		replace: true,
		link: linker,
		template: '<div class="interactions"><div class="answer_button active" id="try_again_button">Try Again</div></div>'
	}
});

quizApp.directive('answer', [ '$compile', 'AnswerService', function ($compile, AnswerService){

	var linker = function (scope, element, attrs) {

	element.on('click', function(e) {
		AnswerService.setCurrentAnswer(element.attr('id'));
		$('#answer_button').removeClass('disabled').addClass('active');
		element.addClass('user_select');
		element.siblings().removeClass('user_select incorrect');
		$('.feedback_text').slideUp();
		
		$compile(element.contents())(scope);
	});

	scope.$on("compile_answer", function(e){
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
}]);

//CONTROLLER
quizApp.controller('mainController',['$scope','QuestionService','$http', function($scope, QuestionService, $http) {

	var self = this;

	var questions = [];

	var qs = QuestionService;

	var fetchQuestions = function () {
		QuestionService.getData().
		//$http.get("model/questions.json").
		then(function (result) {
			QuestionService.questions = result.data.questions;
			
			//QuestionService.currentQuestionId = 0;
			$scope.$broadcast("Data_Ready");
			//$scope.question = QuestionService.getQuestion();
			
		}, function (result) {
			console.log("error: " + result);
		});
	};

	 fetchQuestions();

	$scope.$on('qId:changed', function(){
 		$scope.question = QuestionService.getQuestion();
 		$scope.$broadcast("Data_Ready");
	});

}])
