'use strict';

var express = require('express');
var controller = require('./user.controller');
var router = express.Router();

import * as auth from '../../auth/auth.service';

var router = express.Router();

// get projects of logged-in user
router.get('/projects', auth.isAuthenticated(), controller.getProjects);
// get projects of given user
router.get('/:id/projects', auth.hasRole('admin'), controller.getUserProjects);
// get songs of given user
router.get('/:id/songs', auth.isAuthenticated(), controller.getUserSongs);
// get clips of given user
router.get('/:id/clips', auth.hasRole('admin'), controller.getUserClips);
// get songs of loggedin userlikedsongs
router.get('/songs', auth.isAuthenticated(), controller.getSongs);
// get clips of loggedin user
router.get('/clips', auth.isAuthenticated(), controller.getClips);
//get liked songs of loggedin user
router.get('/likes/song', auth.isAuthenticated(), controller.getLikedSongs);
//get liked users of loggedin user
router.get('/likes/user', auth.isAuthenticated(), controller.getLikedUsers);
//get liked songs of given user
router.get('/:id/likes/song', auth.isAuthenticated(), controller.getUserLikedSongs);
//get liked users of given user
router.get('/:id/likes/user', auth.isAuthenticated(), controller.getUserLikedUsers);
//get liked users of given user
router.get('/:id/likes/user/count', auth.isAuthenticated(), controller.getUserLikesCount);
// router.get('/:id/song/count', auth.isAuthenticated(), controller.getUserSongsCount);
router.get('/:id/recentactivity', auth.isAuthenticated(), controller.getUserRecentActivity);


router.get('/search', auth.isAuthenticated(), controller.getSearchedUsers);
router.put('/updateprofile', auth.isAuthenticated(), controller.updateProfile);
router.put('/:id/like', auth.isAuthenticated(), controller.updateLikeUser);
router.delete('/:id/like', auth.isAuthenticated(), controller.destroyLikeUser);







router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);

//get clips
// TODO

module.exports = router;
