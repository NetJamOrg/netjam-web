app.controller('ProjectmanagerController', ['$scope', '$http', '$state', 'Auth', '$uibModal',
 function($scope, $http, $state, Auth, $uibModal) {
	$scope.dataLoaded = false;

  	$http.get("api/users/projects").then(function success(resProjects) {
  		$scope.projectslist = resProjects.data
  			.map(function (project) {
  				$http.get("/api/projects/"+project._id+"/users").then(function success(resUsers) {
  					project.collabs = resUsers.data;
  					project.isOwner = isOwner(project);
  					project.isActive = isActive(project);
  					// console.log(resUsers.data);
  				});
  				return project;
  			});
  			$scope.dataLoaded = true;
  	});
   
  	var isActive = function(project) {
  		if (!project) { return false; }
  		if (new Date(project.updatedAt) > (new Date() - 7*24*60*60*1000)) {
  			return true;
  		} else {
  			return false;
  		}
  	}

  	var isOwner = function(project) {
  		if (!project) { return false; }
  		var me = Auth.getCurrentUser();
  		var meOwner = false;
  		project.collabs.forEach((c) => {
  			if (me._id == c.collabaccess.UserId && c.collabaccess.access == 2) {
  				 meOwner = true;
  			}
  		});
  		return meOwner;
  	}

  	$scope.openNewProjectModal = function() {
  		var modalInstance = $uibModal.open({
              animation: true,
              templateUrl: 'newprojectmodal.html',
              controller: 'NewProjectController'
            });

      modalInstance.result.then((res) => {
        
        // console.log(p);
      $http.get("api/projects/"+res).then((resProject) => {
        $scope.projectData = resProject.data;
        $http.get("api/projects/"+res+"/users").then((resUsers) => {
          $scope.projectData.collabs = resUsers.data;
          $scope.projectslist.push($scope.projectData);
        });
      });
        $scope.openEditProjectModal(res);
      });
  	}

    $scope.openEditProjectModal = function(pid) {
      var modalInstance = $uibModal.open({
              animation: true,
              templateUrl: 'editprojectmodal.html',
              controller: 'EditProjectController',
              resolve: { p: pid }
            });

      modalInstance.result.then((res) => {
        console.log(res);
      });
    }

    $scope.deleteProject = function(pid) {
      $http.delete("api/projects/"+pid).then((res) => {
        if (res.status == 404) {
          console.log("Project not found");
        } else if (res.status == 204) {
          for (var i = 0; i < $scope.projectslist.length; i++) {
            if ($scope.projectslist[i]._id == pid) {
              $scope.projectslist.splice(i, 1);
            }
          }
        }
      });
    }

}]);

// new project modal controller
angular.module('netJamApp')
  .controller('NewProjectController', ['$scope', '$uibModalInstance', '$http',
   function ($scope, $uibModalInstance, $http) {
    $scope.results = false;

    $scope.createNewProject = function() {
      $http.post("api/projects", {name: $scope.projectName}).then((res) => {
        // console.log(res);
        if (res.status == 201) {
          $scope.success = true;
          $scope.ok(res.data);
        } else {
          $scope.success = false;
        }
        $scope.results = true;
      });
    }

    $scope.ok = function(project) {
      $uibModalInstance.close(project._id);
    }
  	$scope.close = function () {
  		$uibModalInstance.dismiss('cancel');
      return 'cancel'
  	};
}]);

// edit project modal controller
angular.module('netJamApp')
  .controller('EditProjectController', ['$scope', '$uibModalInstance', '$http', 'Auth', 'p',
   function ($scope, $uibModalInstance, $http, Auth, p) {


    $scope.currentUserId = Auth.getCurrentUser()._id;

    $scope.permissions = [
      {id: 0, val: 'View Only'},
      {id: 1, val: 'View & Edit'}
    ];

    // console.log(p);
    $http.get("api/projects/"+p).then((resProject) => {
      $scope.projectData = resProject.data;
      $http.get("api/projects/"+resProject.data._id+"/users").then((resUsers) => {
        $scope.projectData.collabs = resUsers.data;
        console.log($scope.projectData);
      });
    });

    $scope.addUser = function () {
      $http.post("api/projects/"+$scope.projectData._id+"/adduser", { userName: $scope.newUserName }).then((res) => {
        console.log(res);
        if (res.status == 200) {
          $scope.successedit = true;
          $scope.projectData.collabs.push(res.data);
          $scope.newUserName = "";

        } else {
          $scope.successedit = false;
        }
        $scope.resultsedit = true;
      })
    }

    $scope.editUserPermission = function(uid, perm) {
      $http.put("api/projects/"+$scope.projectData._id+"/updatepermission", { userId: uid, newPerm: perm }).then((res) => {

        if (res.status == 201) {
          $scope.successedit = true;
        } else {
          $scope.successedit = false;
        }
        $scope.resultsedit = true;
      });
    }

    $scope.deleteUser = function(uid) {
      console.log("called delete user");
      $http.put("api/projects/"+$scope.projectData._id+"/user", { userId: uid }).then((res) => {
        if (res.status == 404) {
          console.log("User not found");
          $scope.successedit = false;
        } else if (res.status == 204) {
          for (var i = 0; i < $scope.projectData.collabs.length; i++) {
            if ($scope.projectData.collabs[i]._id == uid) {
              $scope.projectData.collabs.splice(i, 1);
              $scope.successedit = true;
            }
          }
        }
        $scope.resultsedit = true;
      });
    }

    $scope.close = function () {
      $uibModalInstance.dismiss('cancel');
      return 'cancel'
    };
}]);