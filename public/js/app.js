angular
  .module('hotkeys', ['ngResource', 'angular-jwt', 'ui.router', 'ngRoute', 'ngMessages'])
  .constant('API', '/api')
  .config(MainRouter)
  .config(function($httpProvider){
    $httpProvider.interceptors.push('authInterceptor');
  });

  MainRouter.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

  function MainRouter($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/404');

    $stateProvider
      .state('home', {
        url: "/",
        templateUrl: "./js/views/home.html",
        controller: "NavController as nav"
      })
      .state('game', {
        url: "/play/:room_id",
        templateUrl: "./js/views/game.html",
        controller: "GamesController as games"
      })
      .state('login', {
        url: "/login",
        templateUrl: "./js/views/login.html"
      })
      .state('register', {
        url: "/register",
        templateUrl: "./js/views/register.html"
      })
      .state('profile', {
        url: "/profile",
        templateUrl: "./js/views/profile.html",
        controller: "ProfileController as profile"
      })
      .state('user', {
        url: "/users/:id",
        templateUrl: "./js/views/profile.html",
        controller: "ProfileController as profile"
      })
      .state('users', {
        url: "/users",
        templateUrl: "./js/views/users.html"
      })
      .state("error", {
        url: "/404",
        templateUrl: "./js/views/404.html"
      });

    // use the HTML5 History API
    $locationProvider.html5Mode(true);

    
  }
