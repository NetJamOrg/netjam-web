'use strict';

import {Router} from 'express';
import * as controller from './clip.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/:id/file', auth.isAuthenticated(), controller.sendFile);
router.post('/:id/file', auth.isAuthenticated(), controller.recvFile);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
