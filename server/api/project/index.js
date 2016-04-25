'use strict';

import {Router} from 'express';
import * as controller from './project.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);


// bad REST naming
// remove user collab link
router.put('/:id/user', auth.isAuthenticated(), controller.removeUser);
// add user to project
router.post('/:id/adduser', auth.isAuthenticated(), controller.addUser);
// update user's permission on project
router.put('/:id/updatepermission', auth.isAuthenticated(), controller.updatePermission);
 // get project's user collabs
router.get('/:id/users', auth.isAuthenticated(), controller.getUsers);
// get project's clips
router.get('/:id/clips', auth.isAuthenticated(), controller.getClips);
// get project's song
router.get('/:id/song', auth.isAuthenticated(), controller.getSong);
// make new clip in project
router.post('/:id/clip', auth.isAuthenticated(), controller.createClip);

// get test project song
//router.get('/song', controller.getTestSong);

module.exports = router;
