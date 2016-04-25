'use strict';

class NavbarController {
  //start-non-standard
  menu = [{
    'title': 'Home',
    'state': 'main',
    'show': 'true'
  }];

  isCollapsed = true;
  //end-non-standard

  constructor(Auth, $uibModal, $http) {
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;
    this.uibModal = $uibModal;
    this.searchString = '';
    this.http = $http;
  }

  // updateSearchTerm() {
  //   this.searchTerm = this.
  // }

  openSearch() {
    if (this.searchString === "") {
      alert("Please enter something to search for!");
    } else {
      this.http.get("/api/users/search", {params: {searchterm: this.searchString}}).then(function (res) {
        return res.data;
      }).then((users) => {
        this.http.get("/api/songs/search", {params: {searchterm: this.searchString}}).then(function (res) {
          return res.data;
        }).then((songs) => {

            if (users)
              users.forEach((element, index, array) => { element.type = 'User'; element.url = "/profile/"+element._id; });
            if (songs)
              songs.forEach((element, index, array) => { element.type = 'Song'; element.url = "/songStorage/"+element._id;});

          var modalInstance = this.uibModal.open({
            animation: true,
            templateUrl: 'mySearchModalContent.html',
            controller: 'SearchModalInstanceCtrl',
            // size: 'lg',
            resolve: {
              users: () => {return users},
              songs: () => {return songs}
            }
          });
        });
      });
    }
  }
}

angular.module('netJamApp')
  .controller('NavbarController', NavbarController);

angular.module('netJamApp')
  .controller('SearchModalInstanceCtrl', ['$scope', '$uibModalInstance', '$http', 'users', 'songs', function ($scope, $uibModalInstance, $http, users, songs) {

  var searchdata = [].concat(songs).concat(users).sort((a,b) => {return new Date(b.createdAt) - new Date(a.createdAt);});
  $scope.searchitems = searchdata;

  $scope.close = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.isResults = function() {
    return ($scope.searchitems.length);
  }
}]);