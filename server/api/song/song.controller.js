// TODO: if not found, create and send.
'use strict';

import _ from 'lodash';
import {User, Project, Song, UserLikeSong} from '../../sqldb';
import config from '../../config/environment';
import fs from 'fs';
import makeSong from '../../makeSong.js';
var path = require('path');
var mime = require('mime');

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

export function getSearchedSongs(req, res, next) {
  //TODO
  var searchterm = '%'+req.query.searchterm+'%';

  if (!searchterm) {
    return res.status(404).end();
  }

  return Song.findAll({
    where: {
        name: {
          like: searchterm
        }
    }
  }).then((songs) => {
    if (!songs) { return res.status(404).end(); }
    return res.json(songs);
  });
};

export function getSongCollaborators(req, res, next) {
  return Song.find({
    where: { _id: req.params.id }
  })
    .then((song) => {
      if (!song) { return res.status(404).end(); }
      return song.getProject()
      .then((project) => {
        if (!project) { return res.status(404).end(); }
          project.getUsers().then((collabs) => {
            return Promise.all(collabs.map((c) => c.profile))
            .then((collabs) => res.json(collabs));
          });
      });
    })
    .catch(err => next(err));
}

export function getSongLikesCount (req, res, next) {
  return UserLikeSong.count({
    where: { SongId: req.params.id }
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

// Gets a list of Songs
export function index(req, res) {
  return Song.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}


// Gets a single song filename and creates it. they can be accessed at /songStorage/name
// TODO: if not found, create and send.
export function sendFile(req, res) {
  console.log('sending');
//  var userId = req.user._id;
  var songId = req.params.id;
  return Song.find({
    where: {
      _id: songId
    }
  }).then((song) => {
    if(!song) {
      return res.status(404);//.end();
    }
    console.log('song found: ' + song);
    if(song /*&& song.getUser._id === userId*/) { // auth check disabled for testing
      // create song
      console.log('making song' + song._id);
      makeSong(song, function(err) {
        if(err) {
          console.log('cant make song file: ' + err);
          return res.status(500);// .end();
        }
        song.pathToFile = config.song.dirName + '/' + song._id + '.wav';
        song.save();

        res.status(200);
        res.json({name: song._id + '.wav'});
      });

      //    } else if(song){
      //      return res.status(403).end(); // found but forbidden
    } else {
      return res.status(404).end(); // song not found
    }
  })
//    .then(handleEntityNotFound(res))
//    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Song from the DB
export function destroy(req, res) {
  return Song.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
