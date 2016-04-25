'use strict';

angular.module('netJamApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('project', {
        url: '/project/:projectId',
        templateUrl: 'app/project/views/project.html',
        controller: 'ProjectController'
      });
  });
