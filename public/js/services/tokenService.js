angular
  .module('hotkeys')
  .service('TokenService', TokenService);

TokenService.$inject = ['$window', 'jwtHelper'];
function TokenService($window, jwtHelper) {

  var self = this;

  self.setToken    = setToken;
  self.getToken    = getToken;
  self.removeToken = removeToken;
  self.decodeToken = decodeToken;

  // Store token in local storage
  function setToken(token) {
    return $window.localStorage.setItem('auth-token', token);
  }

  // Get token from local storage
  function getToken() {
    return $window.localStorage.getItem('auth-token');
  }

  // Logout by destroying token in local storage
  function removeToken() {
    return $window.localStorage.removeItem('auth-token');
  }

  // Unhash token, which contains the user object. Works in concert with the currentUser service. We can now access the currentUser in our controllers
  function decodeToken() {
    var token = self.getToken();
    return token ? jwtHelper.decodeToken(token) : null;
  }
}
