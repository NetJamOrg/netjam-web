'use strict';

import {User, Project, UserCollabProject, UserLikeUser} from '../../sqldb';
import passport from 'passport';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    res.status(statusCode).json(err);
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  return User.findAll({
    attributes: [
      '_id',
      'name',
      'email',
      'role',
      'provider'
    ]
  })
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res, next) {
  var newUser = User.build(req.body);
  newUser.setDataValue('provider', 'local');
  newUser.setDataValue('role', 'user');
  return newUser.save()
    .then(function(user) {
      var token = jwt.sign({ _id: user._id }, config.secrets.session, {
        expiresIn: 60 * 60 * 5
      });
      res.json({ token });
    })
    .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  var userId = req.params.id;

  return User.find({
    where: {
      _id: userId
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).end();
      }
      getLoggedInUser(req)
        .then((u) => u.getLikedUsers({where: {_id: userId}}))
          .then((liked) => {

            if (liked.length == 0) {
              return res.json({profile: user.profile, isLiked: false} );
            } else if (liked.length == 1) {
              return res.json({profile: user.profile, isLiked: true} );
            }
          })
        })
    .catch(err => next(err));
}

export function getSearchedUsers(req, res, next) {
  console.log(req.query);
  var searchterm = '%'+req.query.searchterm+'%';
  console.log(searchterm);

  if (!searchterm) {
    return res.status(404).end();
  }

  return User.findAll({
    where: {
        name: {
          like: searchterm
        }
    }
  }).then((users) => {
    if (!users) {
      return res.status(404).end();
    }
    return Promise.all(users.map((u) => {
      return u.profile;
    })).then((profiles) => res.json(profiles));

  });
};

export function updateProfile(req, res, next) {

  var updatedProfile = req.body;
  getLoggedInUser(req).then((user) => {
    if (user) {
      console.log(updatedProfile);
      user.website = updatedProfile.website;
      user.description = updatedProfile.bio;
      user.avatarImgPath = updatedProfile.avatarImgPath;
      user.backgroundImgPath = updatedProfile.backgroundImgPath;
      user.shortmessage = updatedProfile.shortmessage;
      user.twitterProfile = updatedProfile.twitterProfile;
      user.facebookProfile = updatedProfile.facebookProfile;
      return user.save()
        .then(() => {
          res.status(200).end();
        })
        .catch(validationError(res));
    } else {
      return res.status(304).end();
    }
  });

}

export function updateLikeUser(req, res, next) {
  var targetUserId = req.params.id;

  return User.find({
    where: {
      _id: targetUserId
    }
  })
  .then((targetUser) => {
    if (!targetUser) {
      return res.status(404).end();
    }
    getLoggedInUser(req)
    .then((u) => {
      u.getLikedUsers({where: {_id: targetUserId}})
      .then((liked) => {
        if (liked.length == 1) {
          return res.status(304).end();
        } else if (liked.length == 0) {
          return u.addLikedUser(targetUser).then(() => {res.status(201).end()});
        }
      })
    })
  })
  .catch(err => next(err));
}

export function destroyLikeUser(req, res, next) {
  var targetUserId = req.params.id;

  return User.find({
    where: {
      _id: targetUserId
    }
  })
  .then((targetUser) => {
    if (!targetUser) {
      return res.status(404).end();
    }
    getLoggedInUser(req)
    .then((u) => {
      u.getLikedUsers({where: {_id: targetUserId}})
      .then((liked) => {
        if (liked.length == 0) {
          return res.status(304).end();
        } else if (liked.length == 1) {
          return UserLikeUser.destroy({ where: {UserId: req.user._id, LikedUserId: targetUserId}} ).then(function() {
          res.status(204).end();
        })
        }
      })
    })
  })
  .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.destroy({ _id: req.params.id })
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  return User.find({
    where: {
      _id: userId
    }
  })
    .then(user => {
      if (user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;

  return User.find({
    where: {
      _id: userId
    }
  })
    .then(user => { // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      res.json(user.profile);
    })
    .catch(err => next(err));
}

/*
 * get projects logged-in user collaborates on
 */
export function getProjects(req, res) {
  var userId = req.user._id;
  //console.log(req.user);
  return req.user.getProjects()
    .then((projects) => {
      if(!projects) {
        return res.status(404).end();
      }
      //console.log(projects);
      res.json(projects);
    })
    .catch(err => next(err));
}


/*
 * get projects given user collaborates on
 */
export function getUserProjects(req, res) {
  var userId = req.params.id;
  return Project.findAll({
    include: [{
      model: User,
      where: {
        _id: userId
      },
      through: {
        where: { }
      }
    }]
  })
    .then((projects) => {
      if(!projects) {
        return res.status(404).end();
      }
      res.json(projects);
    })
    .catch(err => next(err));
}

/*
 * get clips logged-in user owns
 */
export function getClips(req, res) {
  return getLoggedInUser(req)
    .then((user) => {
      return user.getClips()
        .then((clips) => {
          if(!clips) {
            return res.status(404).end();
          }
          res.json(clips);
        })
    })
    .catch(err => next(err));
}


/*
 * get clips of given user
 */
export function getUserClips(req, res) {
  return User.find({
    where: { _id: req.params.id }
  })
    .then((user) => {
      return user.getClips()
        .then((clips) => {
          if(!clips) {
            return res.status(404).end();
          }
          res.json(clips);
        })
    })
    .catch(err => next(err));
}

/*
 * get songs logged-in user owns
 */
export function getSongs(req, res) {
  return getLoggedInUser(req)
    .then((user) => {
      return user.getProjects()
      .then((projects) => {
        if (!projects) {
          return res.status(404).end();
        }
        return Promise.all(projects.map((p) => p.getSong()))
        .then((songs) => {
          songs = songs.filter((s) => {return (s)});
          console.log(songs);
          res.json(songs)
        });
      });
    })
    .catch(err => next(err));
}


/*
 * get songs of given user
 */
export function getUserSongs(req, res, next) {
  return User.find({
    where: { _id: req.params.id }
  })
    .then((user) => {
      if (!user) { return res.status(404).end();}
      return user.getProjects()
      .then((projects) => {
        if (!projects) {
          return res.status(404).end();
        }
        return Promise.all(projects.map((p) => p.getSong()))
          .then((songs) => {
            console.log(songs);
            return res.json(songs);
          });
      });
    })
    .catch(err => next(err));
}

// export function getUserSongsCount(req, res, next) {
//   return User.find({
//     where: { _id: req.params.id }
//   })
//     .then((user) => {
//       if (!user) { return res.status(404).end();}
//       return user.getProjects()
//       .then((projects) => {
//         if (!projects) {
//           return res.status(404).end();
//         }
//         return Promise.all(projects.map((p) => p.getSong()))
//         .then((songs) => res.json(songs));
//       });
//     })
//     .catch(err => next(err));
// }

/*
 * get the songs liked by logged-in user
 */
export function getLikedSongs (req, res, next) {
  return getLoggedInUser(req)
    .then((user) => {
      return user.getLikedSongs()
      .then((likedsongs) => {
        if (!likedsongs) {
          return res.status(404).end();
        }
        res.json(likedsongs);
      });
    })
    .catch(err => next(err));
}

/*
 * get the users liked by logged-in user
 */
export function getLikedUsers (req, res, next) {
  return getLoggedInUser(req)
    .then((user) => {
      return user.getLikedUsers()
      .then((likedusers) => {
        if (!likedusers) {
          return res.status(404).end();
        }
        return Promise.all(likedusers.map((lu) => lu.profile))
        .then((profiles) => res.json(profiles));
      });
    })
    .catch(err => next(err));
}

/*
 * get the users liked of a given user
 */
export function getUserLikedUsers (req, res, next) {
  return User.find({
    where: { _id: req.params.id }
  })
    .then((user) => {
      return user.getLikedUsers()
      .then((likedusers) => {
        if (!likedusers) {
          return res.status(404).end();
        }
        return Promise.all(likedusers.map((lu) => lu.profile))
        .then((profiles) => res.json(profiles));
      });
    })
    .catch(err => next(err));
}

function getUserLikesHelper(userId) {
  UserLikeUser.count({where: { LikedUserId: userId }})
    .then((c) => {
        if (!c && c != 0) { return 0; } else {return c;}
    })
}

export function getUserLikesCount (req, res, next) {
  return UserLikeUser.count({
    where: { LikedUserId: req.params.id }
    })
    .then((c) => {
      console.log(c);
        if (!c && c != 0) {
          return res.status(404).end();
        }
        return res.json(c);
    })
    .catch(err => next(err));
}

/*
 * get the songs liked of a given user
 */
export function getUserLikedSongs (req, res, next) {
  return User.find({
    where: { _id: req.params.id }
  })
    .then((user) => {
      return user.getLikedSongs()
      .then((likedsongs) => {
        if (!likedsongs) {
          return res.status(404).end();
        }
        res.json(likedsongs);
      });
    })
    .catch(err => next(err));
}

export function getUserRecentActivity (req, res, next) {
  //
  // todo: query for songs liked, users liked, and songs added by user within 7 days
  //   filter based on time. where: {createdAt: {gt: new Date(??????)}}
  // return layout: { type: [songliked | songadded | userliked], name: [songname | username] | url: [song/:id | profile/:id], when: createdAt }
  return User.find({
    where: {_id: req.params.id }
  })
  .then((user) => {
    return user.getLikedSongs({
      where: {createdAt: {$gt: new Date(new Date() - 7*24*60*60*1000)}}
    }).then((likedsongs) => {
      likedsongs = likedsongs.map((ls) => ls.brief);
      user.getLikedUsers({
        where: {createdAt: {$gt: new Date(new Date() - 7*24*60*60*1000)}}
      }).then((unsafeUsers) => {
        Promise.all(unsafeUsers.map((u) => u.profile))
        .then((likedusers) => {
        user.getProjects()
        .then((projects) => {
          Promise.all(projects.map((p) => p.getSong({
            where: {createdAt: {$gt: new Date(new Date() - 7*24*60*60*1000)}}
          })))
          .then((songs) => {
            songs = songs.filter((s) => {return (s)});
            res.json({likedusers: likedusers, likedsongs: likedsongs, recentsongs: songs});
          });
        })
      })
      })
    })
  })
  .catch(err=> next(err));
}

//////////////
/**
 * Authentication callback
 */
export function authCallback(req, res, next) {
  res.redirect('/');
}

function getLoggedInUser(req) {
  var loggedInId = req.user._id;
  return User.find({
    where: {
      _id: loggedInId
    }
  }).then(function (usr) {
    return usr;
  });
}
