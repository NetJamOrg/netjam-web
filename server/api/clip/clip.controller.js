/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/clips              ->  index
 * PUT     /api/clips/:id/file     ->  sendFIle
 * DELETE  /api/clips/:id          ->  destroy
 *
 * clip creation is done through project
 */

///// TODO

'use strict';

import _ from 'lodash';
import fs from 'fs';
import config from '../../config/environment';
import {Clip, User, Project} from '../../sqldb';

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

// Gets a list of Clips
export function index(req, res) {
  return Clip.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// get a clip file
export function recvFile(req, res) {
  var userId = req.user._id;
  var clipId = req.params.id;
  return Clip.find({
    where: {
      _id: clipId
    }
  }).then((clip) => {
    if(clip && clip.getUser._id === userId) {
      var clipPath = clip.pathToFile;
      // dump body to file
      fs.writeFile(config.root + '/' + config.clip.dirName + '/' + clipPath,
                   req.body, function(err) {
                     if(err) {
                       console.log('error writing clip: ' +err);
                       return res.status(500).end();
                     }
                     else {
                       return res.status(201).end();
                     }
                   });
    } else if(project){
      return res.status(403).end(); // found but forbidden
    } else {
      return res.status(404).end(); // clip not found
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Clip from the DB
export function sendFile(req, res) {
  var userId = req.user._id;
  var clipId = req.params.id;
  return Clip.find({
    where: {
      _id: clipId
    }
  }).then((clip) => {
    if(clip && clip.getUser._id === userId) {
      res.sendFile('../../' + config.clip.dirName + '/' +
                   clip.pathToFile, function(err) {
                     if(err) {
                       console.log('cant send clip file: ' + err);
                       return res.status(500).end();
                     }
                   });
    } else if(project){
      return res.status(403).end(); // found but forbidden
    } else {
      return res.status(404).end(); // clip not found
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
  //    .catch(handleError(res));
}


// Deletes a Clip from the DB
export function destroy(req, res) {
  return Clip.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
