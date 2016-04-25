/*
  diffsync stuff
*/

'use strict';

import config from './environment';
var FsAdapter = require('./diffsync-fs-adapter');

var diffSyncStuff = function(app) {
  var http     = require('http').Server(app);
  var io       = require('socket.io')(http);
  var diffSync = require('diffsync');

  var dataAdapter = new FsAdapter();

  // setting up the diffsync server
  var diffSyncServer = new diffSync.Server(dataAdapter, io);

  // starting the http server
  var port = 4000;
  if(config.diffSync && config.diffSync.port) {
    port = config.diffSync.port;
  }
  var milli = 2000;
  if(config.diffSync && config.diffSync.syncMilliseconds) {
    milli = config.diffSync.syncMilliseconds;
  }

  http.listen(port, function() {
    console.log('diffsync server listening on port ' + port);
//    console.log(diffSyncServer);
  });

  return;
};


module.exports = diffSyncStuff;
