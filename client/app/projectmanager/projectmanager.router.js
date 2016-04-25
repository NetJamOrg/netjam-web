'use strict';

angular.module('netJamApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('projectmanager', {
        url: '/projectmanager',
        templateUrl: 'app/projectmanager/projectmanager.html',
        controller: 'ProjectmanagerController',
        authenticate: 'user'
      });
  });