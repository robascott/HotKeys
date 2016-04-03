angular
  .module('hotkeys')
  .controller('UsersController', UsersController);

UsersController.$inject = ['User', 'TokenService', '$state', 'CurrentUser', '$scope', '$timeout', '$route', '$window', '$rootScope'];
function UsersController(User, TokenService, $state, CurrentUser, $scope, $timeout, $route, $window, $rootScope){
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
    }
    self.user = TokenService.decodeToken();
    CurrentUser.saveUser(self.user);
  }

  // Error handler
  function handleError(e) {
    var message = e.data.message;
    if (e.status===403) {
      self.error = "Incorrect email or password";
    } else if (e.status===401) {
      self.error = "User already exists";
    } else if (e.status===500) {
      self.error = "Server error. Please try again later"
    }
  }

  // Login
  function login() {
    self.error = null;
    if ($scope.users.loginForm.$valid) {
      User.login(self.user, handleLogin, handleError);
    } else {
      self.error = "Incorrect email or password";
    }
  }

  // Register for new account
  function register() {
    self.error = null;
    if ($scope.users.registerForm.$valid) {
      User.register(self.user, handleLogin, handleError);
    } else {
      self.error = "One or more fields invalid"
    }
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
