angular
  .module('hotkeys')
  .controller('UsersController', UsersController);

// Here we inject the currentUser service to access the current user
UsersController.$inject = ['User', 'TokenService', '$state', 'CurrentUser'];
function UsersController(User, TokenService, $state, CurrentUser){

  var self = this;

  self.all           = [];
  self.user          = {};
  self.error         = null;
  self.getUsers      = getUsers;
  self.register      = register;
  self.deleteUser    = deleteUser;
  self.getLoggedInUser = getLoggedInUser
  self.login         = login;
  self.logout        = logout;
  self.checkLoggedIn = checkLoggedIn;

  function getUsers() {
    User.query(function(data){
      self.all = data;
    });
  }


  function getLoggedInUser() {
    //console.log(CurrentUser.getUser());
    User.get({id: CurrentUser.getUser()._id}, function(user) {
      self.user = user;
      
      wpms = user.races;
      console.log(wpms);

    });

    
    //console.log(document.getElementById('wpmChart'));
    //var ctx = document.getElementById("wpmChart").getContext("2d");

      //var wpmLineChart = new Chart(ctx).Line(data, options);

    // var data = {
    //     labels: ["January", "February", "March", "April", "May", "June", "July"],
    //     datasets: [
    //         {
    //             label: "WPMs",
    //             fillColor: "rgba(220,220,220,0.2)",
    //             strokeColor: "rgba(220,220,220,1)",
    //             pointColor: "rgba(220,220,220,1)",
    //             pointStrokeColor: "#fff",
    //             pointHighlightFill: "#fff",
    //             pointHighlightStroke: "rgba(220,220,220,1)",
    //             data: [65, 59, 80, 81, 56, 55, 40]
    //         }
    //     ]
    // };



    
  }

  function handleLogin(res) {
    var token = res.token ? res.token : null;
    if (token) {
      self.getUsers();
      $state.go('home');
    }
    self.user = TokenService.decodeToken();
    CurrentUser.saveUser(self.user);
  }

  function handleError(e) {
    self.error = "Something went wrong.";
  }

  function register() {
    self.error = null;
    User.register(self.user, handleLogin, handleError);
  }

  function deleteUser(user) {
    User.delete({id: user._id});
    var index = self.all.indexOf(user);
    self.all.splice(index,1);
  }

  function login() {
    self.error = null;
    User.login(self.user, handleLogin, handleError);
  }

  function logout() {
    TokenService.removeToken();
    self.all  = [];
    self.user = {};
    CurrentUser.clearUser();
  }

  function checkLoggedIn() {
    var loggedIn = !!TokenService.getToken();
    return loggedIn;
  }

  if (!!CurrentUser.getUser()) {
    self.user = CurrentUser.getUser();
    self.getUsers();
  }

  return self;
}
