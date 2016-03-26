angular
  .module('hotkeys')
  .controller('UsersController', UsersController);

// Here we inject the currentUser service to access the current user
UsersController.$inject = ['User', 'TokenService', '$state', 'CurrentUser', '$scope', '$timeout', '$route', '$window'];
function UsersController(User, TokenService, $state, CurrentUser, $scope, $timeout, $route, $window){
  var self = this;

  self.all           = [];
  self.user          = {};
  self.error         = null;
  
  self.getUsers      = getUsers;
  self.login         = login;
  self.register      = register;
  self.deleteUser    = deleteUser;
  self.checkLoggedIn = checkLoggedIn;

  // Get all users
  function getUsers() {
    User.query(function(data){
      self.all = data;
    });
  }

  // Login hanlder
  function handleLogin(res) {
    var token = res.token ? res.token : null;
    if (token) {
      self.getUsers();
      $state.go('home');
      $window.location.reload();
    }
    self.user = TokenService.decodeToken();
    CurrentUser.saveUser(self.user);
  }

  // Error handler
  function handleError(e) {
    self.error = "Something went wrong.";
  }

  // Login
  function login() {
    self.error = null;
    User.login(self.user, handleLogin, handleError);
  }

  // Register for new account
  function register() {
    self.error = null;
    User.register(self.user, handleLogin, handleError);
  }

  // Delete user
  function deleteUser(user) {
    User.delete({id: user._id});
    var index = self.all.indexOf(user);
    self.all.splice(index,1);
  }

  // Check if there is a user currently logged in
  function checkLoggedIn() {
    var loggedIn = !!TokenService.getToken();
    return loggedIn;
  }

  // Check if a user is currently logged in
  if (!!CurrentUser.getUser()) {
    getUsers();
  }

  return self;
}
