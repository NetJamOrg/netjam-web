'use strict';

angular.module('netJamApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('projectK', {
        url: '/projectK',
        templateUrl: 'app/projectK/projectK.html',
        controller: 'ProjectK',
        // controllerAs?
        authenticate: 'user'
      });
  });