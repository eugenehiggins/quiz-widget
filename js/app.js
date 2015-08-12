

var quizApp = angular.module('quizApp',[]);

//SERVICES

quizApp.service('QuestionService', ['$http','AnswerService', function($http, AnswerService) {

	var self = this

	var currentQuestionId = 0;
	var questions = [];

	self.getData = function() {
		return $http.get("model/quiz1.json");

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

	self.getNextQuestion = function () {
		self.currentQuestionId++;
		AnswerService.setCurrentAnswer = '';
		return self.getQuestion();
	}
	
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
quizApp.directive('quizQuestion', function ($compile, QuestionService) {

	var qs = QuestionService;

	var linker = function (scope, element, attrs) {
		scope.$on("Data_Ready", function(e){

			var question = QuestionService.getQuestion();

			console.log(question);

			var trueFalseTemplate = '<li> <div class="question_stem"> <span>Question #</span> <p>{{ question.text }}</p> </div> <div id="answerImg"></div> <ul class="answer_set"> <li class="answer answer1"><span class="enumeration">True</span></li> <li class="answer answer1"><span class="enumeration">False</span></li> </ul> <div class="feedback"> <div class="feedback_text feedback_hint"> <span>Hint</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> <div class="feedback_text feedback_incorrect"> <span>Not Quite</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> <div class="feedback_text feedback_correct"> <span>That\'s Correct!</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> </div> </li>';
			//var multiTemplate = '<li id="question-' + QuestionService.getCurrentQuestionId() + '"> <div class="question_stem"> <span>Question #</span> <p>' + question.text +'</p> </div> <div id="answerImg"></div> <ul class="answer_set"> <answer ng-model="question" ng-repeat="(key, value) in question.answers" answer="value" key="key"></answer> </ul> <div class="feedback"> <div class="feedback_text feedback_hint"> <span>Hint</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> <div class="feedback_text feedback_incorrect"> <span>Not Quite</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> <div class="feedback_text feedback_correct"> <span>That\'s Correct!</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> </div> </li>';
			var multiTemplate = '<div class="question_stem"> <span>Question #</span> <p>' + question.text +'</p> </div> <div id="answerImg"></div> <ul class="answer_set"> <answer ng-model="question" ng-repeat="(key, value) in question.answers" answer="value" key="key"></answer> </ul> <div class="feedback"> <div class="feedback_text feedback_hint"> <span>Hint</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> <div class="feedback_text feedback_incorrect"> <span>Not Quite</span> <p>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper.</p> </div> <div class="feedback_text feedback_correct">' + question.feedbackCorrect +' </div> </div> <div class="interactions"> <check-answer></check-answer> <next-question></next-question><div class="help_buttons"> <span>Stuck?</span> <span class="help show_hint">Get a hint!</span>  </div> </div>';
			
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

				} else {

					qIndex = getQuestionIndex();
					
					qs = QuestionService;
					as = AnswerService;

					$('.answer').addClass('disabled');
				
					if($(".active")[0] && qs.getQuestion().answers[qIndex].correct === "true"){
						console.log ("correct");
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
						$('#answer_button').text('Reset Question').addClass('reset');
						$('#next_button')
							.addClass('active')
							.on('click', function(){
								scope.question = qs.getNextQuestion();
								scope.$broadcast("Data_Ready");
							});
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

	var linker = function () {

	}

	return {
		link: linker,
		template: '<div class="answer_button" id="next_button">Next Question</div>'
	}
});

quizApp.directive('answer', [ '$compile', 'AnswerService', function ($compile, AnswerService){

	var type = '';

	
	switch (type) {
		case 'TorF':
			scope.question.correct;
			break;
	}

	var linker = function (scope, element, attrs) {
		
		element.on('click', function(e) {
			AnswerService.setCurrentAnswer(element.attr('id'));
			$('#answer_button').removeClass('disabled').addClass('active');
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
}]);

//CONTROLLER
quizApp.controller('mainController', function($scope, QuestionService, $http) {
	var self = this;

	var questions = [];

	var qs = QuestionService;

	var fetchQuestions = function () {
		QuestionService.getData().
		//$http.get("model/questions.json").
		then(function (result) {
			QuestionService.questions = result.data.questions;
			
			QuestionService.currentQuestionId = 0;
			
			$scope.$broadcast("Data_Ready");
			$scope.question = QuestionService.getQuestion();
			
		}, function (result) {
			console.log("error: " + result);
		});
	};

	 fetchQuestions();

})
