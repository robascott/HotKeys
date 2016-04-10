angular
  .module('hotkeys')
  .controller('NavController', NavController);

UsersController.$inject = ['User', 'TokenService', '$state', 'CurrentUser', '$scope', '$timeout', '$route', '$window', 'socket', '$interval'];
function NavController(User, TokenService, $state, CurrentUser, $scope, $timeout, $route, $window, socket, $interval){
  var self = this;

  self.roomName        = "";
  self.getBrandStyle   = getBrandStyle;
  self.checkLoggedIn   = checkLoggedIn;
  self.logout          = logout;
  self.enterRoom       = enterRoom;
  self.leaveRoom       = leaveRoom;
  self.listRooms       = listRooms;
  self.getBodyStyle    = getBodyStyle;
  self.isAdmin         = isAdmin;

  // Check if a user is currently logged in
  function checkLoggedIn() {
    var loggedIn = !!TokenService.getToken();
    return loggedIn;
  }

  // Log out user
  function logout() {
    leaveRoom();
    TokenService.removeToken();
    CurrentUser.clearUser();
    $state.go('home');
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

  // Leave game room
  function leaveRoom() {
    socket.emit('leaveRoom');
    //$window.location.reload();
  }

  // Get a list of the currently active rooms
  function listRooms() {
    socket.emit('getRooms');
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

  // Check whether admin account is logged in
  function isAdmin() {
    return CurrentUser.isAdmin();
  }

  // Log out if JSON web token has expired
  function checkToken() {
    var currentTime = new Date().getTime() / 1000; // Seconds since 1970-01-01
    var expTime = TokenService.decodeToken().exp   // Token expiry time in seconds
    if (currentTime - expTime > 0) {
      TokenService.removeToken();
    }
  }

  if (!!TokenService.getToken()) {
    checkToken();
  }

  return self;
}
