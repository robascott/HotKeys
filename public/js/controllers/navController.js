angular
  .module('hotkeys')
  .controller('NavController', NavController);

// Here we inject the currentUser service to access the current user
UsersController.$inject = ['User', 'TokenService', '$state', 'CurrentUser', '$scope', '$timeout', '$route', '$window', 'socket'];
function NavController(User, TokenService, $state, CurrentUser, $scope, $timeout, $route, $window, socket){

  var self = this;

  self.roomName        = "";
  self.getBrandStyle   = getBrandStyle;
  self.checkLoggedIn   = checkLoggedIn;
  self.logout          = logout;
  self.reloadHome      = reloadHome;
  self.enterRoom       = enterRoom;
  self.disconnect      = disconnect;
  self.listRooms       = listRooms;
  self.getBodyStyle    = getBodyStyle;

  // Check if a user is currently logged in
  function checkLoggedIn() {
    var loggedIn = !!TokenService.getToken();
    return loggedIn;
  }

  // Log out user
  function logout() {
    TokenService.removeToken();
    CurrentUser.clearUser();
    $state.go('home');
    $window.location.reload();
  }

  // Refresh page
  function reloadHome() {
  	$window.location.reload();
  }
  
  // Create new room with randomly generated name
  function enterRoom() {
    if ($scope.roomForm.room.$invalid) { // Invalid input
      // Do nothing
    } else {
      var roomName;
      if (self.roomName.length>0) {  // Valid and non-empty input
        // Get name from user input
      roomName = self.roomName;
      } else {  // Empty input
        // Generate random room name
        roomName = Math.random().toString(36).substr(2, 13);
      }
      $state.go('game', {room_id: roomName});
      listRooms();
    }
  }

  function disconnect() {
    console.log('hey');
    socket.emit('forceDisconnect');
  }

  // Get a list of the currently active rooms
  function listRooms() {
    socket.emit('get rooms');
  }


  // Hide nav bar logo and name if on homepage
  function getBrandStyle() {
    if ($state.current.name=='home') {
      return 'brand-hide';
    }
  }

  // Set body CSS styling
  function getBodyStyle() {
    if ($state.current.name=='home') {
      return {'height': '100%', 'background': '-webkit-repeating-linear-gradient(#403F42, #403F42 39.9%, #FAF8F9 40.1%, #FAF8F9 100%)', 'background': '-moz-repeating-linear-gradient(#403F42, #403F42 39.9%, #FAF8F9 40.1%, #FAF8F9 100%)', 'background': 'repeating-linear-gradient(#403F42, #403F42 39.9%, #FAF8F9 40.1%, #FAF8F9 100%)'};
    } else {
      return {'background-color': '#FAF8F9'};
    }
  }

  

  return self;
}
