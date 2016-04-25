'use strict';
var cell_length = 80;
var colors = ['#EF5350', '#7E57C2', '#EC407A', '#42A5F5', '#FFCA28']
var app = angular.module('netJamApp');

/* DIRECTIVE FOR LISTING TRACKS */
app.directive('myClip', ['$rootScope', 'DiffSyncService',
    function($rootScope, DiffSyncService) {
        return {
            restrict: 'E',
            scope: {
                clip: '=',
                ppb: '=',
                project: '=',
                track: '='
            },
            link: function(scope, element, attrs) {
                // var random = Math.random() * 100;
                // console.log('clip', scope.clip, 'track', scope.track);
                var track = scope.project.tracks[scope.track];
                var clip = track.clips[scope.clip];
                var tracknum = scope.track;
                var clipnum = scope.clip;
                scope.clip_obj = clip;

                console.log(clip);

                element.css('left', clip.start * cell_length);
                element.css('width', clip.length * cell_length);
                element.css('background', colors[tracknum % colors.length]);

                element.on('mousedown', function() {
                    $(this).removeClass('clip');
                });

                element.on('mouseup', function() {
                    $(this).addClass('clip');
                })

                scope.$watch('clip_obj', function() {
                    // track = scope.project.tracks[tracknum];
                    // clip = track.clips[clipnum];
                    // console.log('clip_obj for track', scope.track, 'clip', scope.clip);
                    element.css('left', clip.start * cell_length);
                    element.css('width', clip.length * cell_length);
                    element.css('background', colors[tracknum % colors.length]);
                }, true);

                // Almost certainly TODO: dynamicaly adjusting the segment after BPM change?
                var trackid = '#track' + scope.track;
                $(function() {
                    var pixels_in_beat = scope.ppb;
                    var setPixelSnap = function(pixels_in_beat) {
                        // console.log('Setting up clip snapping to', pixels_in_beat, 'pixels');
                        element.draggable({
                            obstacle: ".clip",
                            preventCollision: false,
                            axis: 'x',
                            snapMode: 'inner',
                            grid: [pixels_in_beat, 0],
                            containment: trackid,
                            scroll: true,
                            drag: function(event, ui) {
                                clip.start = Math.round(ui.position.left / pixels_in_beat);
                                var curr_project_end = scope.project.clips_end;
                                var new_end = clip.start + clip.length;
                                if (new_end > curr_project_end) {
                                    scope.project.clips_end = new_end;
                                    $rootScope.$broadcast('update cells per track');
                                    scope.project.max_length_track = scope.track
                                }
                                DiffSyncService.update();
                                // console.log(JSON.stringify(scope.project));
                                // console.log('moving containment', trackid, 'scope.track', scope.track);
                            }
                        });
                    }

                    setPixelSnap(pixels_in_beat);
                })
            }
        };
    }
]);
/* directive for listing tracks */
