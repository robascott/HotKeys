angular
  .module('hotkeys')
  .factory('socket', socketConnect);

function socketConnect() {
	var socket = io();

	return socket;
}

