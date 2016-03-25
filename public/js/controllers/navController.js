angular
  .module('hotkeys')
  .controller('NavController', NavController);

// Here we inject the currentUser service to access the current user
UsersController.$inject = ['User', 'TokenService', '$state', 'CurrentUser', '$scope', '$timeout', '$route', '$window', 'socket'];
function NavController(User, TokenService, $state, CurrentUser, $scope, $timeout, $route, $window, socket){

  var self = this;

  self.checkLoggedIn = checkLoggedIn;
  self.logout = logout;
  self.reloadHome = reloadHome;
  self.newRoom = newRoom;
  self.listRooms = listRooms;

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
  function newRoom() {
    var roomId = 'r' + Math.random().toString(36).substr(2, 9);
    $state.go('game', {room_id: roomId});
    listRooms();
  }

  // Get a list of the currently active rooms
  function listRooms() {
    socket.emit('get rooms');
  }

  return self;
}
