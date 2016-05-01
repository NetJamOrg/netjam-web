'use strict';

angular.module('netJamApp')
  .service('DiffSyncService', ['Auth', '$http', '$interval', '$rootScope', '$stateParams', function(Auth, $http, $interval, $rootScope, $stateParams) {

    console.log('HELLO', $stateParams.projectId);
    var that = {};

    // var currentUser = Auth.getCurrentUser();
    // console.log('cur user ' + JSON.stringify(currentUser));
    // var authed = false;

    // if(!authed) {
    //   return that;
    // }



    var DiffSyncClient = diffsync.Client;
    var client, data;

    var id = $stateParams.projectId;

    var currentUser = Auth.getCurrentUser();

    var tok = Auth.getToken();
    console.log('token ' + tok);

    $http.get("/api/projects/"+$stateParams.projectId+"/users").then(function (response) {
      var projectUsers = response.data;
      console.log('cur ' + JSON.stringify(currentUser));
      console.log('users ' + JSON.stringify(projectUsers));

      var authed = projectUsers.some(u => u._id == currentUser._id);
      console.log('authed ' + JSON.stringify(authed));

      if(authed) {
        client = new DiffSyncClient(io('http://' + window.location.hostname + ':4000',
                                       {
                                         query: 'token=' + tok,
                                       }), id);

        client.on('connected', function() {
          data = client.getData();
          that.data = data;
          console.log('connected event', that.data);
          client.sync();
        });

        client.on('synced', function() {
          $rootScope.$broadcast('new synced data', that.data);
        });

        client.on('error', function(err) {
          console.log('DIFFSYNC ERROR EVENT', err);
        });

        client.initialize();

        that.update = function() {
          client.sync();
        };
      }
      else {
        that.err = 'not authed';
      }

    }, function(err) {
      console.log('not authorized to view this project' + JSON.stringify(err));
    });

    return that;
  }]);
