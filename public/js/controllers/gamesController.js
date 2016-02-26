angular
  .module('hotkeys')
  .controller('GamesController', GamesController);

GamesController.$inject = ['User', 'Race', 'TokenService', '$state', 'CurrentUser', '$sce', '$interval', '$timeout', 'socket', '$scope'];
function GamesController(User, Race, TokenService, $state, CurrentUser, $sce, $interval, $timeout, socket, $scope){

  var self = this;

  self.loggedIn = !!CurrentUser.getUser();

  var paragraphText;
  var paragraphWords;
  var paragraphHtmlArray = "";
  var wordIndex = 0;

  self.inputText = "";
  self.typedSoFar = "";

  self.tempName = "";  // name input
  self.timerText = ""; //

  // Set name
  if (self.loggedIn) {
    self.name = CurrentUser.getUser().local.username;
  } else {
    self.name = Math.random().toString(36).substr(2, 5);
  }

  // Player data
  self.myData = {percentage: "", wpm: 0};
  self.playerData = {};  // e.g. {234235235: {name: 'James', perctentage: 24, position: 1}, 23412353: {name: 'Mark', percentage: 18, position: 2}}
  self.playerPositions = {} // e.g. {234235235: 1, 3452345234: 2}
  
  
  // Game state info
  self.currentState; // countdown|racing|finished
  self.noOfPlayersInRound;
  self.inputDisabled = true;
  self.gameRunning = false;
  self.nowRacing = false;
  self.waitingToJoin = true;
  self.incorrect = false;
  var nextWord = "";


  // Check if race is already in progress
  socket.emit('is game running');

  var responsesArray = [];
  socket.on('reporting game state to client', function(data) {
    responsesArray.push(data.gameRunning);
  });

  $timeout(function() {
    if (responsesArray.indexOf(true) > -1) {
      self.gameRunning = true;
      self.waitingToJoin = true;
    } else {
      self.waitingToJoin = false;
      socket.emit('show marker (remote)', {id: socket.id, name: self.name});
    }
  }, 1000);



  
  // Get paragraph text
  function getText() {
    return content[Math.floor(Math.random()*content.length)];
  }


  // Update temporary username
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
      alert('Name already exists!');
    }
  }

  // Calculate and set the WPM of player
  self.calcWpm = function(time) {
  	self.myData['wpm'] = Math.floor((self.typedSoFar.length*1.0/5)/time);
  }


  // Calculate and set percentage complete
  self.calcCompleteness = function() {
    var percentageComplete = (self.typedSoFar.length/paragraphText.length)*100;
    socket.emit('update markers', {id: socket.id, percentage: percentageComplete, wpm: self.myData.wpm});
    self.myData['percentage'] = percentageComplete;
  }


  // Update paragraph text
  self.updateState = function() {
  	if (nextWord.lastIndexOf(self.inputText, 0) === 0) {
  		self.incorrect = false
  		paragraphHtmlArray[wordIndex+1] = "<span class='correct'>" + nextWord.trim() + "</span>";
  		if (self.inputText.length == nextWord.length) {
  			self.typedSoFar += self.inputText;
        self.calcCompleteness();
  			paragraphHtmlArray[wordIndex+1] = "<span>" + nextWord + "</span>";
  			wordIndex++;
  			if (wordIndex===paragraphWords.length) {
          self.currentState = 'finished';
  				reachedFinish();
  			} else if (wordIndex===paragraphWords.length-1) { // last word
  				nextWord = paragraphWords[wordIndex]; // no space after final word
          paragraphHtmlArray[wordIndex+1] = "<span class='correct'>" + nextWord.trim() + "</span>";
  			} else {
  				nextWord = paragraphWords[wordIndex] + " ";
          paragraphHtmlArray[wordIndex+1] = "<span class='correct'>" + nextWord.trim() + "</span>";
  			}
  			self.inputText = "";
  		}
  	} else {
  		self.incorrect = true;
  		paragraphHtmlArray[wordIndex+1] = "<span class='incorrect'>" + nextWord.trim() + "</span>";
  	}
  	self.paragraphHtmlString = paragraphHtmlArray.join(" ");
  }


  // Render paragraph on page
  self.renderParagraph = function() {
  	return $sce.trustAsHtml(self.paragraphHtmlString);
  }


  // Convert position to ordinal
  function convertToOrdinal(n) {
    var ords = {1: 'st', 2: 'nd', 3: 'rd'};
    if (n==='DNF') {
      return 'DNF';
    } else {
      return n + (ords[n % 100] || 'th');
    }
  }

  
  // Return number of players still racing
  function playersLeftInRace() {
    var finishedPlayers = 0;
    Object.keys(self.playerData).forEach(function(id) {
      if (self.playerData[id].position) {
        finishedPlayers++;
      }
    });
    return self.noOfPlayersInRound - finishedPlayers;
  }

  
  // Save race result to database
  function saveRace(race) {
    var race = { race: { wpm: parseInt(self.myData.wpm), user: CurrentUser.getUser()._id } };

    Race.save(race, function(data) {
    })
  }


  // Send 'reached finish' message to other players
  function reachedFinish() {
    self.nowRacing = false;
    self.inputText = "";
    self.inputDisabled = true;

    var myPos = Object.keys(self.playerPositions).length + 1
    self.playerPositions[socket.id] = myPos;
    self.myData.position = convertToOrdinal(myPos);

    if (playersLeftInRace()===0) {
      socket.emit('race over', {id: socket.id, position: myPos});
    } else {
      socket.emit('reached finish', {id: socket.id, position: myPos});
    }

    if (self.loggedIn) {
      saveRace();
    }
  }


  // Send 'DNF' message to other players
  function didNotFinish() {
    self.inputText = "";
    self.incorrect = false;
    self.inputDisabled = true;
    self.nowRacing = false;

    self.myData.position = 'DNF';
    socket.emit('race over', {id: socket.id, position: 'DNF'});
  }

  
  // Start round timer
  self.startTimer = function(duration) {
  	var timer = duration, minutes, seconds;
  	timerInterval = $interval(function () {
  		minutes = parseInt(timer / 60, 10);
  		seconds = parseInt(timer % 60, 10);

  		if (self.currentState=='racing' && (duration-timer >= 1)) {
  			var minutesElapsed = ((duration-timer)*1.0)/60;
  			self.calcWpm(minutesElapsed);
  		}

  		minutes = minutes < 10 ? + minutes : minutes;
  		seconds = seconds < 10 ? "0" + seconds : seconds;

  		self.timerText = minutes + ":" + seconds;


  		if (--timer < 0) {
  			if (self.currentState==='countdown') {
  				self.inputDisabled = false;
  				$interval.cancel(timerInterval);
          self.currentState = 'racing'
  				self.startTimer(100);
  			} else if (self.currentState==='finished') {
  				$interval.cancel(timerInterval);
  			}	else if (self.currentState==='racing') {
          $interval.cancel(timerInterval);
          didNotFinish();
        }
  		}
  	}, 1000);
  }

  
  // Inform players in room to start new game
  self.newGame = function() {
    var text = getText();
    //var text = "This is a test sentence";
    socket.emit('start game', {text: text});
  }

  // Reset game state
  self.startGame = function() {
  	self.gameRunning = true;
    self.nowRacing = true;
  	self.inputDisabled = true;
    self.noOfPlayersInRound = Object.keys(self.playerData).length;
    
    self.tempName = "";
    self.inputText = "";
    self.typedSoFar = "";
    self.myData = {percentage: "", wpm: 0};
    self.playerData = {};
    self.playerPositions = {};
  	wordIndex = 0;

    socket.emit('show marker (remote)', {id: socket.id, name: self.name});

  	nextWord = paragraphText.split(" ")[0] + " ";
  	paragraphHtmlArray = paragraphText.split(" ");
  	paragraphHtmlArray.unshift("<p>");
  	paragraphHtmlArray.push("</p");
  	paragraphHtmlArray[1] = "<span class='correct'>" + nextWord.trim() + "</span>";
  	self.paragraphHtmlString = paragraphHtmlArray.join(" ");
    self.currentState = 'countdown';
  	self.startTimer(3); // Set timer
  }

  
  // Socket messages
  socket.on('start game', function(data) {
    paragraphText = data.text;
    paragraphWords = paragraphText.split(" ");
    self.startGame();
  });

  socket.on('update markers', function(data) {
    self.playerData[data.id].percentage = data.percentage;
    self.playerData[data.id].wpm = data.wpm
  });


  socket.on('player left', function(data) {
    if (self.gameRunning) {
      self.playerData[data.id].position = convertToOrdinal(data.position);
      $scope.$apply();
    }
  });

  socket.on('player finished', function(data) {
    if (data.position!=='DNF') {
      self.playerPositions[data.id] = data.position;
    }

    self.playerData[data.id].position = convertToOrdinal(data.position);
    $scope.$apply();
  });


  socket.on('show marker', function() {
    if (!self.waitingToJoin) {
      console.log('not waiting');
      socket.emit('show marker (remote)', {id: socket.id, name: self.name});
    }
  });

  socket.on('show marker (remote)', function(data) {
    self.playerData[data.id] = {};
    self.playerData[data.id].percentage = "";
    self.playerData[data.id].wpm = "";
    self.playerData[data.id].name = data.name;
    $scope.$apply();
  });

  socket.on('update name', function(data) {
    self.playerData[data.id].name = data.name;
    $scope.$apply();
  });

  socket.on('remove user', function() {
    if (!self.gameRunning) {
      self.playerData = {};
      socket.emit('show marker (remote)', {id: socket.id, name: self.name});
      $scope.$apply();
    }
  });

  socket.on('get game state', function() {
    socket.emit('reporting game state to server', {gameRunning: self.gameRunning});
  });

  socket.on('end game', function() {
    self.gameRunning = false;
    console.log('game ended');
    if (self.waitingToJoin) {
      socket.emit('show marker (remote)', {id: socket.id, name: self.name});
      self.waitingToJoin = false;
    } else {
      $interval.cancel(timerInterval);
      self.timerText = "0:00";
    }
    $scope.$apply();
  })


  return self;

 }