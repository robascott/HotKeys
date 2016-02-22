angular
  .module('hotkeys')
  .controller('GamesController', GamesController);

// Here we inject the currentUser service to access the current user
GamesController.$inject = ['User', 'TokenService', '$state', 'CurrentUser', '$sce'];
function GamesController(User, TokenService, $state, CurrentUser, $sce){

  var self = this;

  self.inputDisabled;

  var paragraphText = "The UK will be taking a 'big gamble' with its security if it votes to leave the European Union, defence secretary Michael Fallon has claimed. The 'collective weight' of partnerships such as the EU made it easier to deal with global threats, he told the BBC.";
  var paragraphWords = paragraphText.split(" ");
  var wordIndex = 0;

  self.paragraphHTML = "<p>The UK will be taking a 'big gamble' with its security if it votes to leave the European Union, defence secretary Michael Fallon has claimed. The 'collective weight' of partnerships such as the EU made it easier to deal with global threats, he told the BBC.</p>";
  var paragraphHtmlArray = ""

  self.typed = "";

  self.timerText = "0:03";

  self.incorrect = false;

  var nextWord = "";

  self.updateState = function() {
  	if (nextWord.lastIndexOf(self.typed, 0) === 0) {
  		self.incorrect = false
  		paragraphHtmlArray[wordIndex+1] = "<span class='correct'>" + nextWord.trim() + "</span>";
  		if (self.typed.length == nextWord.length) {
  			paragraphHtmlArray[wordIndex+1] = "<span>" + nextWord + "</span>";
  			wordIndex++;
  			if (wordIndex===paragraphWords.length) {
  				endGame();
  			} if (wordIndex===paragraphWords.length-1) {
  				nextWord = paragraphWords[wordIndex];
  			} else {
  				nextWord = paragraphWords[wordIndex] + " ";
  			}
  			paragraphHtmlArray[wordIndex+1] = "<span class='correct'>" + nextWord.trim() + "</span>";
  			self.typed = "";
  		}
  	} else {
  		self.incorrect = true;
  		paragraphHtmlArray[wordIndex+1] = "<span class='incorrect'>" + nextWord.trim() + "</span>";
  	}
  	self.paragraphHtmlString = paragraphHtmlArray.join(" ");
  }

  self.renderParagraph = function() {
  	return $sce.trustAsHtml(self.paragraphHtmlString);
  }


  function endGame() {

  }

  self.startTimer = function(duration) {
  	var timer = duration, minutes, seconds;
  	var timerInterval = setInterval(function () {
  		console.log('one second');
  		minutes = parseInt(timer / 60, 10);
  		seconds = parseInt(timer % 60, 10);

  		minutes = minutes < 10 ? + minutes : minutes;
  		seconds = seconds < 10 ? "0" + seconds : seconds;

  		self.timerText = minutes + ":" + seconds;
  		console.log(self.timerText)

  		if (--timer < 0) {
  			console.log('reached zero')
  			//gameRunning = false;
  			//timeUp = true;
  			self.inputDisabled = false;
  			console.log(self.inputDisabled);
  			clearInterval(timerInterval);
  		}
  	}, 1000);
  }


  self.newGame = function() {
  	self.inputDisabled = false;
  	wordIndex = 0;
  	nextWord = paragraphText.split(" ")[0] + " ";
  	paragraphHtmlArray = paragraphText.split(" ");
  	paragraphHtmlArray.unshift("<p>");
  	paragraphHtmlArray.push("</p");
  	paragraphHtmlArray[1] = "<span class='correct'>" + nextWord.trim() + "</span>";
  	self.paragraphHtmlString = paragraphHtmlArray.join(" ");
  	self.startTimer(2); // Set timer
  }


  self.newGame();


  return self;

 }