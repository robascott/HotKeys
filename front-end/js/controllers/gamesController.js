angular
  .module('hotkeys')
  .controller('GamesController', GamesController);

// Here we inject the currentUser service to access the current user
GamesController.$inject = ['User', 'TokenService', '$state', 'CurrentUser', '$sce'];
function GamesController(User, TokenService, $state, CurrentUser, $sce){

  var self = this;

  var paragraphText = "The UK will be taking a 'big gamble' with its security if it votes to leave the European Union, defence secretary Michael Fallon has claimed. The 'collective weight' of partnerships such as the EU made it easier to deal with global threats, he told the BBC.";
  var paragraphWords = paragraphText.split(" ");
  var wordIndex = 0;

  self.paragraphHTML = "<p>The UK will be taking a 'big gamble' with its security if it votes to leave the European Union, defence secretary Michael Fallon has claimed. The 'collective weight' of partnerships such as the EU made it easier to deal with global threats, he told the BBC.</p>";

  self.typed = "";

  self.incorrect = false;

  var nextWord = "";

  self.updateState = function() {
  	console.log("Typed so far: " + self.typed);
  	if (nextWord.lastIndexOf(self.typed, 0) === 0) {
  		self.incorrect = false
  		console.log(self.typed.length);
  		if (self.typed.length == nextWord.length) {
  			wordIndex++;
  			nextWord = paragraphWords[wordIndex] + " ";
  			self.typed = "";
  		}
  	} else {
  		self.incorrect = true;
  	}
  }

  self.renderParagraph = function() {
  	return $sce.trustAsHtml(self.paragraphHTML);
  }


  self.newGame = function() {
  	wordIndex = 0;
  	nextWord = paragraphText.split(" ")[0] + " ";
  }


  self.newGame();


  return self;

 }