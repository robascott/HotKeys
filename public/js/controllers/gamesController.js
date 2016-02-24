angular
  .module('hotkeys')
  .controller('GamesController', GamesController);

GamesController.$inject = ['User', 'TokenService', '$state', 'CurrentUser', '$sce', '$interval', 'socket', '$scope'];
function GamesController(User, TokenService, $state, CurrentUser, $sce, $interval, socket, $scope){

  var self = this;

  self.inputDisabled = true;

  var paragraphText = "Five members of the Friends cast have finally come together in a much-anticipated Friends reunion on US TV. The cast of the 1990s hit comedy, minus Matthew Perry, reunited on NBC's Tribute to James Burrows on Sunday. They reminisced during the two-hour tribute that featured clips from the respected director's roster of shows.";
  var paragraphWords = paragraphText.split(" ");
  var wordIndex = 0;

  var paragraphHtmlArray = ""

  self.inputText = "";
  self.typedSoFar = "";
  self.wpm = "0";

  self.tempName = "";
  self.name = Math.random().toString(36).substr(2, 5);


  self.myData = {percentage: 0};
  self.playerData = {};  // {234235235: {name: 'Robin', perctentage: 24}, 23412353: {name: 'Simon', percentage: 18}}


  self.timerText = "";

  self.incorrect = false;

  self.gameRunning = false;

  var nextWord = "";


  self.updateUsername = function() {

    var nameAlreadyExists = false;

    Object.keys(self.playerData).forEach(function(id) {
        if (self.playerData[id].name.toLowerCase() === self.tempName.toLowerCase()) {
          nameAlreadyExists = true;
          self.tempName = "";
        }
    });

    if (!nameAlreadyExists) {
      self.name = self.tempName;
      socket.emit('update name',{id: socket.id, name:self.name});
      self.tempName = "";
    } else {
      alert('name already exists!');
    }
    
  }

  self.calcWpm = function(time) {
  	self.wpm = Math.floor((self.typedSoFar.length*1.0/5)/time);
  }

  self.calcCompleteness = function() {
    var percentageComplete = (self.typedSoFar.length/paragraphText.length)*100;
    socket.emit('update progress', {id: socket.id, percentage: percentageComplete});
    self.myData['percentage'] = percentageComplete;
  }

  self.updateState = function() {
  	if (nextWord.lastIndexOf(self.inputText, 0) === 0) {
  		self.incorrect = false
      self.calcCompleteness();
  		paragraphHtmlArray[wordIndex+1] = "<span class='correct'>" + nextWord.trim() + "</span>";
  		if (self.inputText.length == nextWord.length) {
  			self.typedSoFar += self.inputText;
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
  			self.inputText = "";
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
  	//
  }

  self.startTimer = function(duration, mode) {
  	var timer = duration, minutes, seconds;
  	var timerInterval = $interval(function () {
  		minutes = parseInt(timer / 60, 10);
  		seconds = parseInt(timer % 60, 10);

  		if (mode=='end' && (duration-timer >= 2 && seconds % 2 == 0)) {
  			var minutesElapsed = ((duration-timer)*1.0)/60;
  			self.calcWpm(minutesElapsed);
  		}

  		minutes = minutes < 10 ? + minutes : minutes;
  		seconds = seconds < 10 ? "0" + seconds : seconds;

  		self.timerText = minutes + ":" + seconds;


  		if (--timer < 0) {
  			if (mode==='start') {
  				self.inputDisabled = false;
  				$interval.cancel(timerInterval);
  				self.gameRunning = true;
  				self.startTimer(10,'end');
  			} else if (mode==='end') {
  				self.inputText = "";
          self.incorrect = false;
  				self.inputDisabled = true;
  				$interval.cancel(timerInterval);
  				self.gameRunning = false;
  			}	
  		}
  	}, 1000);
  }

  self.newGame = function() {
    socket.emit('start game');
  }


  self.startGame = function() {
  	self.gameRunning = false;
  	self.inputDisabled = true;
  	wordIndex = 0;
  	nextWord = paragraphText.split(" ")[0] + " ";
  	paragraphHtmlArray = paragraphText.split(" ");
  	paragraphHtmlArray.unshift("<p>");
  	paragraphHtmlArray.push("</p");
  	paragraphHtmlArray[1] = "<span class='correct'>" + nextWord.trim() + "</span>";
  	self.paragraphHtmlString = paragraphHtmlArray.join(" ");
  	self.startTimer(3,'start'); // Set timer
  }

  socket.on('start game', function() {
    self.startGame();
  });

  socket.on('update progress (remote)', function(data) {
    self.playerData[data.id].percentage = data.percentage;
  });

  socket.on('show marker', function() {
    socket.emit('show marker (remote)', {id: socket.id, name: self.name});
  });

  socket.on('show marker (remote)', function(data) {
    self.playerData[data.id] = {}
    self.playerData[data.id].percentage = 0;
    self.playerData[data.id].name = data.name;
    $scope.$apply();
  });

  socket.on('update name', function(data) {
    self.playerData[data.id].name = data.name;
    $scope.$apply();
  });

  socket.on('remove user', function(data) {
    if (!self.gameRunning) {
      self.playerData = {};
      socket.emit('show marker (remote)', {id: socket.id, name: self.name});
      $scope.$apply();
    }
  })


  return self;

 }