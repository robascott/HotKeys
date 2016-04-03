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

  // Get user's race stats
  function getStats() {
    var races = self.user.races;
    var wpms = [];

    var totalWpm = 0;
    races.forEach(function(race) {
      wpms.push(race.wpm);
      totalWpm += race.wpm;
    });

    self.user.totalRaces = wpms.length;
    self.user.bestWpm = Math.max.apply(Math, wpms);

    if (races.length === 0) {
      self.user.averageWpm = 0;
    } else {
      var averageWpm = totalWpm*1.0 / races.length;
      self.user.averageWpm = Math.round(averageWpm * 100) / 100;
    }
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
            strokeColor: "#e74c3c",
            pointColor: "black",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: []
          }
        ]
      };

      var races = self.user.races;
      var wpms = [];

      races.forEach(function(race) {
        wpms.push(race.wpm);
      });

      // Get 20 most recent races
      wpms = wpms.slice(Math.max(0,wpms.length - 20));

      var maxWpm = Math.max.apply(Math, wpms);
      var minWpm = Math.min.apply(Math, wpms);

      var startValue = Math.max((Math.round(minWpm / 5) * 5) - 20, 0);
      var endValue = (Math.ceil(maxWpm/5) * 5) + 10;
      var noOfSteps = (endValue - startValue)/5;

      var options = {
        scaleOverride: true,
        scaleStartValue: startValue,
        scaleStepWidth: 5,
        scaleSteps: noOfSteps,
        tooltipTemplate: "<%= value %>"
      };

      var wpmLineChart = new Chart(ctx).Line(data, options);

      races.forEach(function(race) {
        if (race.wpm) {
          wpmLineChart.addData([race.wpm], moment(race.date).format('YYYY-MM-DD'));
        }
      });
    }
  }

  // Retrieve relevant user
  if (!!$state.params.id) {
    User.get({id: $state.params.id}, function(user) {
      self.user = user
      createGraph();
      getStats();
    }, function(res) {
      if (res.status === 404 || res.status === 401) {
        $state.go('error');
      }
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
