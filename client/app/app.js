'use strict';

angular.module('netJamApp', [
  'ui.router',
  'netJamApp.auth',
  'netJamApp.admin',
  'netJamApp.constants',
  //'netJamApp.profile', TODO ?
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.bootstrap',
  'validation.match',
  'ngMaterial'
])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
