'use strict';

angular.module('netJamApp')
    .directive('footer', ['$location', function(location) {
        return {
            templateUrl: 'components/footer/footer.html',
            restrict: 'E',
            link: function(scope, element) {
                scope.shouldShow = function() {
                    if (location.path() !== '/project') {
                		element.addClass('footer');
                    	element.removeClass('display-none');      		
                    	return true;
                    }
                    element.addClass('display-none');
                    return false;
                }
            }
        };
    }]);
