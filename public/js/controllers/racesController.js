angular
  .module('hotkeys')
  .controller('RacesController', RacesController);

RacesController.$inject = ['User', 'TokenService', '$state', 'CurrentUser', '$sce', '$interval', '$timeout', '$scope'];
function RacesController(User, TokenService, $state, CurrentUser, $sce, $interval, $timeout, $scope){

  var self = this;

  self.race = {};
}