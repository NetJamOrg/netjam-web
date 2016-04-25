'use strict';

var app = angular.module('netJamApp');

/* DIRECTIVE FOR LISTING TRACKS */
app.directive('delaySlideLeft',
    function() {
        return {
            restrict: 'A',
            scope: {
                delay: '='
            },
            link: function(scope, element, attrs) {
                console.log('element[0]: ' + element[0]);
                var item = element[0];

                if (null != item && undefined != item) {
                    setTimeout(function() {
                        item.className += ' slide-in-left';
                    }, scope.delay);
                }
            }
        };
    }
);
/* directive for listing tracks */
