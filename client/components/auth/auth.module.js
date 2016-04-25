'use strict';

angular.module('netJamApp.auth', [
  'netJamApp.constants',
  'netJamApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
