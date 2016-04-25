/**
 * Sequelize initialization module
 */

'use strict';

import path from 'path';
import config from '../config/environment';
import Sequelize from 'sequelize';

var db = {
  Sequelize,
  sequelize: new Sequelize(config.sequelize.uri, config.sequelize.options)
};

// Insert models below
db.Song = db.sequelize.import('../api/song/song.model');
db.Thing = db.sequelize.import('../api/thing/thing.model');
db.User = db.sequelize.import('../api/user/user.model');
db.Project = db.sequelize.import('../api/project/project.model');
db.Clip = db.sequelize.import('../api/clip/clip.model');
db.UserCollabProject = db.sequelize.import('../models_misc/UserCollabProject.model');
db.UserLikeUser = db.sequelize.import('../models_misc/UserLikeUser.model');
db.UserLikeSong = db.sequelize.import('../models_misc/UserLikeSong.model');



db.Clip.associate(db);
db.Song.associate(db);
db.User.associate(db);
db.Project.associate(db);

// Object.keys(db).forEach(function(modelName) {
// 	if ("associate" in db[modelName]) {
// 		db[modelName].associate(db);
// 	}
// });

module.exports = db;