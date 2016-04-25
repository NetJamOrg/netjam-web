/**
 * Song model events
 */

'use strict';

import {EventEmitter} from 'events';
var Song = require('../../sqldb').Song;
var SongEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
SongEvents.setMaxListeners(0);

// Model events
var events = {
  'afterCreate': 'save',
  'afterUpdate': 'save',
  'afterDestroy': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Song.hook(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc, options, done) {
    SongEvents.emit(event + ':' + doc._id, doc);
    SongEvents.emit(event, doc);
    done(null);
  }
}

export default SongEvents;
