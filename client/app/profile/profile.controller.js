var app = angular.module('netJamApp');

app.controller('ProfileController', ['$scope', '$http', '$state', function($scope, $http, $state) {
  $scope.dataLoaded = false;

  $http.get("api/users/"+$state.params.id)
    .then(function successCallback(response) {
      $scope.profile = response.data.profile;
      $scope.isLiked = response.data.isLiked;
      $http.get("/api/users/"+$state.params.id+"/songs").then(function (response) {
        $scope.songs = response.data
          .filter((song) => {return (song)} )
          .map(function (song) {
            $http.get("/api/songs/"+song._id+"/collaborators").then(function (res) {
              song.collaborators = res.data;
            });
            $http.get("/api/songs/"+song._id+"/likes").then(function (res) {
              song.likescount = res.data;
            });
            return song;
          });

        console.log($scope.statuscode);
      });


      $http.get("/api/users/"+$state.params.id+"/likes/song").then(function (response) {
        $scope.likedsongs = response.data;
        console.log($scope.statuscode);
      });

      $http.get("/api/users/"+$state.params.id+"/likes/user").then(function (response) {
        $scope.likedusers = response.data;
        console.log($scope.statuscode);
      });

      $http.get("/api/users/"+$state.params.id+"/likes/user/count").then(function (response) {
        $scope.likescount = response.data;
        console.log($scope.statuscode);
      });

      $http.get("/api/users/"+$state.params.id+"/recentactivity").then(function (response) {
        $scope.recentactivity = response.data;
        console.log($scope.statuscode);
      });
    }, function errorCallback(response) {
      $state.go('main');
    })
    .then(() => {
      $scope.dataLoaded = true;});

  $scope.addLikeUser = function() {
    $http.put("/api/users/"+$state.params.id+"/like").then(function (response) {
      if (response.status == 201) {
        $scope.isLiked = true;
      } else {
        console.log("Like failed");
        console.log(response.status);
      }
    });
  }

  $scope.removeLikeUser = function() {
    $http.delete("/api/users/"+$state.params.id+"/like").then(function (response) {
      if (response.status == 204) {
        $scope.isLiked = false;
      } else {
        console.log("Unlike failed");
        console.log(response.status);
      }
    });
  }

  $scope.playSong = function(sid) {
    $http.get('/api/songs/' + sid + '/file')
      .then(function(resp) {
        var aud = new Audio('/songStorage/' + sid + '.wav');
        aud.play();
      });
  }

}]);
