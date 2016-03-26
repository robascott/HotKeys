angular
  .module('hotkeys')
  .controller('ProfileController', ProfileController);

// Here we inject the currentUser service to access the current user
ProfileController.$inject = ['User', 'TokenService', '$state', 'CurrentUser', '$scope', '$window'];
function ProfileController(User, TokenService, $state, CurrentUser, $scope, $window){
  var self = this;

  self.user          = {};

  self.checkLoggedIn = checkLoggedIn;
  self.getStats      = getStats;
  self.createGraph   = createGraph;

  // Check if there is a user currently logged in
  function checkLoggedIn() {
    var loggedIn = !!TokenService.getToken();
    return loggedIn;
  }

  function getStats() {
    var races = self.user.races;
    self.user.totalRaces = races.length;

    var totalWpm = 0;
    races.forEach(function(race) {
      totalWpm += race.wpm;
    });

    var averageWpm = totalWpm*1.0 / races.length;
    self.user.averageWpm = Math.round(averageWpm * 100) / 100;
  }

  // Create graph for profile page
  function createGraph() {
    if ($state.current.name=='profile' || $state.current.name=='user') {
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

  // Retrieve relevant user
  if (!!$state.params.id) {
    User.get({id: $state.params.id}, function(user) {
      console.log(user);
      self.user = user
      createGraph();
      getStats();
    });
  } else if (!!CurrentUser.getUser()) {
    User.get({id: CurrentUser.getUser()._id}, function(user) {
      self.user = user;
      createGraph();
      getStats();
    });
  }

  return self;
}
