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
  self.createGraph   = createGraph;


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

  // Create graph for profile page
  function createGraph() {
    if ($state.current.name=='profile') {
      var ctx = document.getElementById("wpmChart").getContext("2d");

      var data = {
        labels: [],
        datasets: [
          {
            label: "WPMs",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: []
          }
        ]
      };

      var wpmLineChart = new Chart(ctx).Line(data); // options is 2nd argument

      var races = self.user.races

      races.forEach(function(race) {
        if (race.wpm) {
          wpmLineChart.addData([race.wpm], "");
        }
      });

    }
  }

  
  // Check if a user is currently logged in
  if (!!CurrentUser.getUser()) {
    self.getUsers();

    User.get({id: CurrentUser.getUser()._id}, function(user) {
      self.user = user;
      createGraph();
    });
  }

  return self;
}
