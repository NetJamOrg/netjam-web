'use strict';

import {Router} from 'express';
import * as controller from './song.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/search', auth.isAuthenticated(), controller.getSearchedSongs);
router.get('/:id/file', /*auth.isAuthenticated(), */ controller.sendFile); // auth disabled for testing
router.get('/:id/collaborators', auth.isAuthenticated(), controller.getSongCollaborators)
router.get('/:id/likes', auth.isAuthenticated(), controller.getSongLikesCount)

router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
