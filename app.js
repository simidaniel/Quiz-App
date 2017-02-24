!function() {
	/*
	 * Data:
	 *
	 * Here are some quiz questions.
	 */

	var data = [
		{
			prompt: 'What is the capital of Pennsylvania?',
			answers: [
				'Texas',
				'Detroit',
				'Philadelphia',
				'Miami',
				'Hariisburg'
			],
			correctIndex: 4
		},{
			prompt: 'Who is the president of USA?',
			answers: [
				'Donald Trump',
				'Ronald Reagan',
				'Bill Clinton'
			],
			correctIndex: 0
		},{
			prompt: 'Who invented the electric light bulb?',
			answers: [
				'Martin Luther King',
				'Bill Clinton',
				'Thomas Edison'
			],
			correctIndex: 2
		}
	];

	/*
	 * Handling Data (Model):
	 *
	 * These objects handle all of the data for the app. In this
	 * case our data are in the form of quiz questions, where each
	 * question has a prompt, a set of answers, and a correct answer.
	 */
	
	/*
	 * The Question object represents a single question. It has
	 * properties that reflect the data, and a set of methods
	 * to interact with that data.
	 */
	function Question(datum) {
		this.prompt = datum.prompt;
		this.answers = datum.answers;
		this.correctIndex = datum.correctIndex;
	}

	Question.prototype.checkAnswer = function(index) {
		return index === this.correctIndex;
	};

	Question.prototype.forEachAnswer = function(callback, context) {
		this.answers.forEach(callback, context);
	};

	/*
	 * The Quiz object is a collection of question objects.
	 * It creates the questions from data, stores the questions,
	 * and keeps track of what question you're on and how many
	 * questions you've gotten right.
	 */
	function Quiz(data) {
		this.numberCorrect = 0;
		this.counter = 0;
		this.questions = [];

		this.addQuestions(data);
	}

	Quiz.prototype.addQuestions = function(data) {
		for (var i = 0; i < data.length; i++) {
			this.questions.push(new Question(data[i]));
		}
	};

	Quiz.prototype.advanceQuestion = function(lastAnswer) {
		if (this.currentQuestion && this.currentQuestion.checkAnswer(lastAnswer)) {
			this.numberCorrect++;
		}

		this.currentQuestion = this.questions[this.counter++];

		return this.currentQuestion;
	};

	/*
	 * Handling Logic (Controller)
	 *
	 * These objects handle the business logic of our app. The logic
	 * in this case is "start quiz", "next question" and "end quiz".
	 */

	/*
	 * The QuizApp object coordinates all the other objects in the
	 * application, and controls the flow of the quiz.
	 */
	function QuizApp(data) {
		this.data = data;
		this.introView = new IntroView('#quiz-intro', this);
		this.outroView = new OutroView('#quiz-outro', this);
		this.questionView = new QuestionView('#quiz-form', this);
		
		this.introView.attachEventHandlers();
		this.outroView.attachEventHandlers();
		this.questionView.attachEventHandlers();
	}

	QuizApp.prototype.startQuiz = function() {
		this.quiz = new Quiz(this.data);

		this.introView.toggle(true);
		this.outroView.toggle(true);
		this.questionView.toggle(false);

		this.nextQuestion();
	};

	QuizApp.prototype.nextQuestion = function(answer) {
		var nextQuestion = this.quiz.advanceQuestion(answer);
		
		if (nextQuestion) {
			this.questionView.setQuestion(nextQuestion);
		} else {
			this.endQuiz();
		}
	};

	QuizApp.prototype.endQuiz = function() {
		this.questionView.toggle(true);
		this.outroView.toggle(false);

		this.outroView.displayOutroMessage(this.quiz.numberCorrect, this.quiz.questions.length);
	};
	
	/*
	 * Handling Presentation (View):
	 *
	 * These objects handle all of the manipulation of the DOM as well
	 * as handling events triggered on the DOM. We have three views, one
	 * for each section of the application.
	 */

	/*
	 * The IntroView handles interaction with the #quiz-intro section
	 * and its .start-button. When the start button is clicked it
	 * starts the quiz by interacting with its QuizApp object through
	 * the startQuiz method. It also implements methods to attach
	 * event handlers and toggle its visibility.
	 */
	function IntroView(selector, quizApp) {
		this.element = $(selector);
		this.startButton = this.element.find('.start-button');
		this.quizApp = quizApp;
	}

	IntroView.prototype.attachEventHandlers = function() {
		var self = this;

		this.startButton.click(function() {
			self.quizApp.startQuiz();
		});
	};

	IntroView.prototype.toggle = function(hide) {
		this.element.toggleClass('hidden', hide);
	};
	
	/*
	 * The OutroView is similar to the IntroView, with the addition
	 * of a displayOutroMessage method which displays an appropriate
	 * message based on the number of correct answers and the total
	 * number of questions.
	 */
	function OutroView(selector, quizApp) {
		this.element = $(selector);
		this.resetButton = this.element.find('.reset-button');
		this.outroMessage = this.element.find('.quiz-outro-message');
		this.quizApp = quizApp;
	}

	OutroView.prototype.displayOutroMessage = function(numberCorrect, totalQuestions) {
		var message = 'You got ' + numberCorrect + ' questions right out of ' + 
			totalQuestions + '. Would you like to try again?';

		this.outroMessage.html(message);
	};

	OutroView.prototype.attachEventHandlers = function() {
		var self = this;

		this.resetButton.click(function() {
			self.quizApp.startQuiz();
		});
	};

	OutroView.prototype.toggle = function(hide) {
		this.element.toggleClass('hidden', hide);
	};
	
	/*
	 * The QuestionView is where most of the action is. It has similar methods
	 * that attach event handlers and toggle the element visibility. It also
	 * implements a setQuestion method that takes a question and generates
	 * the HTML for the prompt and answers and puts them into the DOM.
	 */
	function QuestionView(selector, quizApp) {
		this.element = $(selector);
		this.submitAnswerButton = this.element.find('.submit-answer-button');
		this.questionContainer = this.element.find('.question-container');
		this.answersContainer = this.element.find('.answers-container');
		this.quizApp = quizApp;
	}

	QuestionView.prototype.attachEventHandlers = function() {
		var self = this;

		this.submitAnswerButton.click(function() {
			var checkedInput = self.answersContainer.find('input:checked');

			if (!checkedInput.length) alert('Please select an answer');
			else {
				var answer = +checkedInput.val();
				self.quizApp.nextQuestion(answer);
			}
		});
	};

	QuestionView.prototype.setQuestion = function(question) {
		var radios = '';

		this.questionContainer.text(question.prompt);

		question.forEachAnswer(function(answer, index) {
			radios += 
				'<li>' +
					'<input type="radio" name="answer" value="' + index + '" id="answer' + index + '"></input>' +
					'<label for="answer' + index + '">' + answer + '</label>' +
				'</li>';
		});

		this.answersContainer.html(radios);
	};

	QuestionView.prototype.toggle = function(hide) {
		this.element.toggleClass('hidden', hide);
	};
	
	/*
	 * Then when the document is ready, we do stuff!!!
	 */

	$(function() {
		var quizApp = new QuizApp(data);
	});
}();