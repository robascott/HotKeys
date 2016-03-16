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

  function checkLoggedIn() {
    var loggedIn = !!TokenService.getToken();
    return loggedIn;
  }

  function logout() {
    TokenService.removeToken();
    self.all  = [];
    self.user = {};
    CurrentUser.clearUser();
    $state.go('home');
    //$route.reload();
    $window.location.reload();
  }

  function reloadHome() {
  	$window.location.reload();
  }

  function newRoom() {
    var roomId = 'r' + Math.random().toString(36).substr(2, 9);
    $state.go('game', {room_id: roomId});
    listRooms();
  }

  function listRooms() {
    socket.emit('get rooms');
  }

  return self;
}
