angular
  .module('hotkeys')
  .service('CurrentUser', CurrentUser);

CurrentUser.$inject = ["TokenService"];
function CurrentUser(TokenService){

  var self  = this;
  self.user = null;

  self.saveUser = function(user){
    self.user = user;
  };

  self.getUser = function(){
    return TokenService.decodeToken();
  };

  self.clearUser = function(){
    self.user = {};
  };

  self.loggedIn = function() {
    if (!!TokenService.decodeToken()) {
      return true;
    } else {
      return false;
    }
  }

  self.isAdmin = function() {
    if (!!TokenService.decodeToken() && self.getUser().local.email === "admin@admin.com") {
      return true;
    } else {
      return false;
    }
  }

}
