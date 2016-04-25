var app = angular.module('netJamApp');

/* PROJECT CONTROLER */
app.controller('ProjectController', ['$scope', '$stateParams', 'DiffSyncService', '$uibModal', '$log', '$http', '$location',
    function($scope, $stateParams, DiffSyncService, $uibModal, $log, $http, $location) {

        console.log('projectId param', $stateParams.projectId);
        // INIT SCOPE VARS
        $scope.pref = {};
        $scope.pref.NUM_TRACKS = 5;
        $scope.pref.MIN_CELLS_PER_TRACK = 20;
        $scope.pref.CELL_LENGTH = 15;
        $scope.pref.PADDING_CELLS = 5;
        $scope.pref.PPB = 80;

        $scope.diffSync = DiffSyncService;
        // $scope.project = $scope.diffSync.data;

        $scope.project = {};
        // $scope.project.tracks = {};
        // $scope.project.length = 240;
        // $scope.project.clips_end = 0;


//      $scope.aud = {};

        // TODO: Replace with actual service call to retrieve project data

        // var newTrack = { id: 0, name: 'Untitled ' + 0 };
        // newTrack.length = 240;
        // newTrack.clips = {};
        // newTrack.clips[0] = { start: 1, length: 2 };
        // newTrack.clips[1] = { start: 6, length: 3 };
        // $scope.project.tracks[0] = newTrack;
        // for (var i = 1; i <= $scope.pref.NUM_TRACKS; i++) {
        //     var newTrack = { id: i, name: 'Untitled ' + i };
        //     newTrack.length = 240;
        //     newTrack.clips = {};
        //     for (var j = 0; j < 5; j++) {
        //         newTrack.clips[j] = { start: Math.floor(Math.random() * 7), length: Math.floor(Math.random() * 5) };
        //     }
        //     $scope.project.tracks[i] = newTrack;
        // }

        // console.log('project', $scope.project);


        // HELPERS

        //used for ng-repeat to repeat a given number of times
        $scope.getNumber = function(num) {
            if (!num) return [];
            return new Array(num);
        };


        $scope.openRecord = function() {
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/projectK/projectK.html',
                controller: 'ProjectK',
                size: 'lg'
            });

            modalInstance.result.then(function(args) {
                $scope.audioFile = args;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
                console.log('audioFile', $scope.audioFile);
            });

        };

        // determine the number of cells to insert inside of a track
        var cellsPerTrack = function() {
            var cells = $scope.project.clips_end + $scope.pref.PADDING_CELLS;
            cells = Math.ceil(Math.max(cells, $scope.pref.MIN_CELLS_PER_TRACK));
            // console.log('Cells: ', cells);
            $scope.project_cells = cells;
        };

        //    cellsPerTrack();

        /* ADD TRACK BTN */
        /* MOVE ADD TRACK BTN */
        var add_track_btn = document.getElementById('add-track');
        add_track_btn.addEventListener('mousedown', mousedownAddTrack);
        var mouseStartPosition = {};

        function mousedownAddTrack(e) { // jshint ignore:line
            // get mouse position
            mouseStartPosition.x = e.pageX;
            mouseStartPosition.y = e.pageY;

            // add listeners for mousemove, mouseup
            window.addEventListener('mousemove', mousemoveAddTrack);
            window.addEventListener('mouseup', mouseupAddTrack);
        }

        var wait = false;
        var throttle_speed = 20;

        function mousemoveAddTrack(e) {
            if (!wait) {
                add_track_btn.style.left = (e.pageX - add_track_btn.offsetWidth / 2) + 'px';
                add_track_btn.style.top = (e.pageY - add_track_btn.offsetHeight / 2) + 'px';
                wait = true;
                setTimeout(function() { wait = false; }, throttle_speed);
            }
        }

        function mouseupAddTrack(e) {
            window.removeEventListener('mousemove', mousemoveAddTrack);
            window.removeEventListener('mouseup', mouseupAddTrack);
        }
        /* move add track button */
        var getRandomIntInclusive = function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        var generateId = function(obj, min, max) {
            var id = getRandomIntInclusive(min, max);
            while (id in obj) id = getRandomIntInclusive(min, max);
            return id;
        };

        var getGreatestTrackId = function() {
            return ($scope.project.greatest_track_id ? $scope.project.greatest_track_id : 0);
        };

        $scope.addTrack = function() {
            var id = getGreatestTrackId() + 1;
            $scope.project.greatest_track_id++;
            var newTrack = { id: id, name: 'Untitled ' + id };
            $scope.project.tracks[id] = newTrack;
            console.log('add track, id', id, 'project', $scope.project);
            DiffSyncService.update();
        };

        var getNewGreatest = function(tracks) {
            var greatest = 0;
            for (var track in tracks) {
                if (track > greatest) greatest = track;
            }
            return track;
        };

        $scope.removeTrack = function(id) {
            delete $scope.project.tracks[id];
            if (id == getGreatestTrackId) $scope.project.greatest_track_id = getNewGreatest();
            DiffSyncService.update();
        };
        /* add track btn */

        $scope.trackSort = function(track) {
            return track.sort_val;
        };

        $scope.$on('new synced data', function(event, data) {
            console.log('new synced data event', data);
            $scope.$applyAsync(function() {
                $scope.project = data;
                // console.log('diffsync project update', $scope.project);
                cellsPerTrack();
            });
        });

        $scope.$on('update cells per track', function(event, data) {
            // console.log('updating cells per track');
            cellsPerTrack();
            $scope.$apply();
        });



        $scope.location = $location;

        $scope.paused = true;
        var paused = true;
        $scope.pausePlay = function() {
            console.log('broadcasting pause play');

            if (this.paused) {
                // play
                console.log('playing');
                $http({ method: 'GET', url: '/api/projects/' + $stateParams.projectId + '/song' }).then(function(data) {
                        console.log('success', data.data._id);
                  $http({ method: 'GET', url: '/api/songs/' + data.data._id + '/file' }).then(function(data) {
                    var url = '/songStorage/' + data.data.name;
                    console.log('success', url);
                    var aud = new Audio(url);
//                    $scope.aud.type = 'audio/wav';
                    aud.play();
                    $scope.aud = aud;
                  }, function(err) {
                    console.log('error', err);
                  });
                },
                function() {
                  console.log('error');
                });
            } else {
              // pause
                $scope.aud.pause();
                console.log('pausing');
            }
            this.paused = !this.paused;
        };
    }
]);
