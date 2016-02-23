angular
  .module('hotkeys')
  .service('CurrentUser', CurrentUser);

// We inject the token service into the this currentUser service and this service will be the one we call in our user controller
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

}
