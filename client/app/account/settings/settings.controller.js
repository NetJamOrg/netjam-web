'use strict';

class SettingsController {
  constructor(Auth, $http) {
    this.errors = {};
    this.submitted = false;
    this.$http = $http;
    this.messageProfile = "";

    this.Auth = Auth;
    this.profile = $http.get("/api/users/me").then(function (res) {
      return res.data;
    });
  }

  changePassword(form) {
    this.submitted = true;
    if (form.$valid) {
      this.Auth.changePassword(this.user.oldPassword, this.user.newPassword)
        .then(() => {
          this.message = 'Password successfully changed.';
        })
        .catch(() => {
          form.password.$setValidity('mongoose', false);
          this.errors.other = 'Incorrect password';
          this.message = '';
        });
    }
  }

  updateProfile(form) {
    this.messageProfile = this.$http.put("/api/users/updateprofile", this.profile.$$state.value).then(function (res) {
      if (res.status == 200) {
        return "Successfully updated profile attributes";
      } else if (res.status == 304) {
        return "Failed to update profile attributes";
      }
      return "Something broke...";
    });

    //this.messageProfile = this.messageProfile.$$state.value;
  }

}

angular.module('netJamApp')
  .controller('SettingsController', SettingsController);
