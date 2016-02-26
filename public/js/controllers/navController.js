angular
  .module('hotkeys')
  .controller('NavController', NavController);

// Here we inject the currentUser service to access the current user
UsersController.$inject = ['User', 'TokenService', '$state', 'CurrentUser', '$scope', '$timeout', '$route', '$window'];
function NavController(User, TokenService, $state, CurrentUser, $scope, $timeout, $route, $window){

  var self = this;

  self.checkLoggedIn = checkLoggedIn;
  self.logout = logout;
  self.reloadHome = reloadHome;

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
  	$route.reload();
  	$window.location.reload();
  }

  return self;
}
