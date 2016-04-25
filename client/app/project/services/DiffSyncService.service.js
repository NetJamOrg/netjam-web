'use strict';

angular.module('netJamApp')
    .service('DiffSyncService', ['$interval', '$rootScope', '$stateParams', function($interval, $rootScope, $stateParams) {

        console.log('HELLO', $stateParams.projectId);
        var that = {};

        var DiffSyncClient = diffsync.Client;
        var client, data;

        var id = $stateParams.projectId;

        client = new DiffSyncClient(io('https://netjam.xyz'), id);

        client.on('connected', function() {
            // the initial data has been loaded,
            // you can initialize your application
            data = client.getData();
            that.data = data;
            console.log('connected event', that.data);
            client.sync();
        });

        client.on('synced', function() {
            // an update from the server has been applied
            // you can perform the updates in your application now
            $rootScope.$broadcast('new synced data', that.data);
            // console.log('synced event', data);
        });

        client.on('error', function(err) {
            console.log('DIFFSYNC ERROR EVENT', err);
        });

        client.initialize();

        /* --- somewhere in your code --- */

        that.update = function() {
            client.sync();
        };

        return that;
    }]);
