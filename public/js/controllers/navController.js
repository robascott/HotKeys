angular
  .module('hotkeys')
  .controller('NavController', NavController);

// Here we inject the currentUser service to access the current user
UsersController.$inject = ['User', 'TokenService', '$state', 'CurrentUser', '$scope', '$timeout'];
function NavController(User, TokenService, $state, CurrentUser, $scope, $timeout){

  var self = this;

  self.checkLoggedIn = checkLoggedIn;


  function checkLoggedIn() {
    var loggedIn = !!TokenService.getToken();
    return loggedIn;
  }

  return self;
}
