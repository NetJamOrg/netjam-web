/*
 * diffsync filesystem adapter for project jsons
 */

'use strict';

import config from './environment';
import {Project}  from '../sqldb';
var diffSync =  require('diffsync');
var fs = require('fs');
var path = require('path');


var newProjContents = fs.readFileSync(path.join(config.root, config.diffSync.projectJSONDirectory, 'template.json'), { encoding: 'utf-8'});
console.log(newProjContents);

var projDir = config.diffSync.projectJSONDirectory;

var FsAdapter = function() {
  this.memdb = new diffSync.InMemoryDataAdapter();
  setInterval(this.syncMemToProjInfoFile.bind(this), config.diffSync.syncMilliseconds);
};

FsAdapter.prototype.getData = function(id, callback) {
  console.log('getdata', id);
  if(this.inMemDb(id)) { // return memdb's contents
    console.log('inmem', id, this.getFromMemDb(id));
    callback(null, this.getFromMemDb(id));
  } else { // get from fs, save to memdb
    var projectJSONs = fs.readdir(projDir, (err, files) => {
      console.log(files);
      if(err) {
        console.log(err);
        return callback(err, null);
      }
      if(files.indexOf(id + '.json') !== -1) {
        console.log('infile', id);
        var filePath = projDir + '/' + (id + '.json');
        var projectJSON = fs.readFile(filePath, 'utf8', (err, data) => {
          if(err) {
            console.log(err);
            return callback(err, null);
          }
          var newData = JSON.parse(data);
          console.log('getfromfs', id, newData);
          // TODO check for parse error
          this.setInMemDb(id, newData);
          callback(null, newData);
        });
      }
      else { // not in mem or fs. return "blank" project
        console.log('not in mem or fs');
        callback(null, newProjContents);
      }
    });
  }
};

FsAdapter.prototype.storeData = function(id, data, callback){
  this.setInMemDb(id, data);
};


FsAdapter.prototype.inMemDb = function(id) {
  var cache = this.memdb.cache;
  return (id in cache);
};

FsAdapter.prototype.getFromMemDb = function(id) {
  var cache = this.memdb.cache;
  return cache[id];
}

FsAdapter.prototype.setInMemDb = function(id, data) {
  this.memdb.storeData(id, data);
}

FsAdapter.prototype.syncMemToProjInfoFile = function() {
  var cache = this.memdb.cache;

  // for each diffsync id
  for (var id in cache) {
    if (Object.prototype.hasOwnProperty.call(cache, id)) {
      var data = cache[id];
      if(data != undefined && data != null) {
        Project.find({ id: id })
          .then((proj) => {
            proj.pathToFile = projDir + '/' + id + '.json';
          });
        fs.writeFileSync(projDir + '/' + id + '.json', JSON.stringify(data));
//        console.log("syncing to fs: " + id, data);
      }
    }
  }
}

module.exports = FsAdapter;
