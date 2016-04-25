'use strict';

angular.module('netJamApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('profile', {
        url: '/profile/:id',
        templateUrl: 'app/profile/profile.html',
        controller: 'ProfileController',
        // controllerAs?
        authenticate: 'user'
      });
  });