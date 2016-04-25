/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/projects              ->  index
 * POST    /api/projects              ->  create
 * GET     /api/projects/:id          ->  show
 * PUT     /api/projects/:id          ->  update
 * DELETE  /api/projects/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import { User,
         Project,
         UserCollabProject,
         Clip,
         Song } from '../../sqldb';
import config from "../../config/environment"

var fs = require('fs');

var newProjContents = '{"clips_end":50,"length":240,"tracks":{"5":{"clips":{},"length":240,"name":"Untitled5","id":5},"4":{"clips":{},"length":240,"name":"Untitled4","id":4},"3":{"clips":{},"length":240,"name":"Untitled3","id":3},"2":{"clips":{},"length":240,"name":"Untitled2","id":2},"1":{"clips":{},"length":240,"name":"Untitled1","id":1},"0":{"clips":{"1":{"id":1"length":2,"start":20},"0":{"id":1"length":2,"start":13}},"length":240,"name":"Untitled0","id":0}}}';


function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function(entity) {
    return entity.updateAttributes(updates)
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.destroy()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Projects
export function index(req, res) {
  return Project.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Project from the DB if the user is authorized to see it
export function show(req, res) {
  var userId = req.user._id;
  return Project.find({
    where: {
      _id: req.params.id
    }
  }).then((project) => {
    return project.getUsers()
      .then((users) => {
        if(users && users.some(u => u._id === userId)) {
          res.json(project);
        } else if(project){
          return res.status(403).end(); // forbidden
        } else {
          return res.status(404).end(); // proj not found
        }
      });
  })
    .catch(handleError(res));
}

export function addUser(req, res) {
  var userId = req.user._id;
  return Project.find({
    where: {
      _id: req.params.id
    }
  }).then((project) => {
    return User.findOne({where: {name: req.body.userName}}).then((newuser) => {
      return project.getUsers()
      .then((users) => {
        if(users && users.some(u => u._id === userId)) {
          project.addUser(newuser).then((response) => {
            if (!response)
              return res.status(404).end();

            return res.json(newuser.profile);
          });
        } else if(project){
          return res.status(403).end(); // forbidden
        } else {
          return res.status(404).end(); // proj not found
        }
      });
    })
  })
    .catch(handleError(res));
}

// Creates a new Project in the DB owned by to logged-in user
export function create(req, res) {
  return Project.create({
    name: req.body.name
  })
    .then((project) => {
      project.addUser(req.user, {access: 2});
      project.pathToFile = config.root + "/projectInfos/" + project._id + '.json';
      fs.writeFileSync(project.pathToFile, newProjContents, 'utf8');
      return project.save();
    })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Project in the DB
export function update(req, res) {
  var userId = req.user._id;
  if (req.body._id) {
    delete req.body._id;
  }
  return Project.find({ // i am 95% convinced this is right
    where: {}, // project attrs
    include: [{
      model: User,
      where: {
        // User attrs
      },
      through: {
        where: {
          // collab attrs
        }
      }
    }]
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res)); // commented out so i can see the exceptions..
}

// Deletes a Project from the DB
// model is configured such that destroying a project *should* destroy the collab relation
export function destroy(req, res) {
  return Project.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function removeUser(req, res) {

  return UserCollabProject.findOne({
    where: {
      ProjectId: req.params.id,
      UserId: req.body.userId
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function updatePermission(req, res, next) {

  //todo: check if owner
  var newPerm = parseInt(req.body.newPerm);
  return UserCollabProject.findOne({
    where: {
      ProjectId: req.params.id,
      UserId: req.body.userId
    }
  }).then((collab) => {
    collab.access = newPerm;
    return collab.save();
  }).then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// user must be in project
export function getUsers(req, res) {
  var pid = req.params.id;
  var loggedInUser;
  return Project.find({
    where: {
      _id: pid
    }
  })
    .then((project) => {
      if(!project) {
        return res.status(404).end();
      }
      project.getUsers()
        .then((users) => {
          getLoggedInUser(req)
            .then((loggedInUser) => {
              if(users.some(u => u._id === loggedInUser._id)) {
                return Promise.all(users.map((u) => {
                  var collabaccess = u.UserCollabProject;
                  u = u.profile;
                  u.collabaccess = collabaccess;
                  return u;
                }))
                  .then((profiles) => res.json(profiles));
              }
              else {
                return res.status(403).end(); // forbidden
              }
            });
        });
    })
    .catch(err => next(err));
}

// user must be in project
export function getClips(req, res) {
  var pid = req.params.id;
  return Project.find({
    where: {
      _id: pid
    }
  })
    .then((project) => {
      if(!project) {
        return res.status(404).end();
      }
      project.getUsers()
        .then((users) => {
          getLoggedInUser(req)
            .then((loggedInUser) => {
              if(users.some(u => u._id === loggedInUser._id)) {
                project.getClips()
                  .then((clips) => res.json(clips));
              }
              else {
                return res.status(403).end(); // forbidden
              }
            });
        });
    })
    .catch(err => next(err));
}

// user must collab in proj
// returns the song object and makes a new one if it didnt exist
// call get songs/id to get/generate the actual song
export function getSong(req, res) {
  var pid = req.params.id;
  return Project.find({
    where: {
      _id: pid
    }
  })
    .then((project) => {
      if(!project) {
        return res.status(404).end();
      }
      project.getUsers()
        .then((users) => {
          getLoggedInUser(req)
            .then((loggedInUser) => {
              if(users.some(u => u._id === loggedInUser._id)) {
                project.getSong()
                  .then((song) => {
                    if(!song) {
                      return Song.create({pathToFile: null})
                        .then((newSong) => {
                          res.json(newSong);
                        });
                    }
                    else {
                      res.json(song);
                    }
                  });
              }
              else {
                return res.status(403).end(); // forbidden
              }
            });
        });
    })
    .catch(err => next(err));
}



// owned by logged in user
// should be like { name, file: <byte buffer of clip> }
export function createClip(req, res) {
  var clipName = req.body.name;
  var clipFile = req.body.file;
  return Clip.create({ name: clipName})
    .then((clip) => {
      var clipPath = config.root + "/" + config.clip.dirName + "/" + clip._id + '.wav';
      clip.pathToFile = clipPath;
      return clip.save()
        .then(() => Project.find({
          where: { _id: req.params.id }
        })
              .then((proj) => {
                if(!proj) {
                  return res.status(404).end();
                }
                else {
                  return clip.setProject(proj)
                    .then(() => getLoggedInUser(req))
                    .then((user) => {
                      if(!user) {
                        return res.status(403).end();
                      }
                      else {
                      var temp = __dirname;
                       return fs.writeFile(clipPath, clipFile.substring(22) , {encoding:'base64'},function(err) {
                          if(err) {
                            console.log(err);
                            return res.status(500).end();
                          }
                          return clip.setUser(user)
                            .then(() => {
                              res.status(201);
                              return res.json({
                                id: clip._id
                              });
                            });
                        }); // TODO file format?
                        /*
                        fs.write(fd, clipFile, 0, clipFile.length, function(err, written, buffer) {
console.log('7');
                          if(err) {
                          }
                        });
                        */
                      }
                    })
                }
              })
             );
    })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}


function getLoggedInUser(req) {
  var loggedInId = req.user._id;
  return User.find({
    where: {
      _id: loggedInId
    }
  });
}
