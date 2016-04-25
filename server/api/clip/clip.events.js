/**
 * Clip model events
 */

'use strict';

import {EventEmitter} from 'events';
var Clip = require('../../sqldb').Clip;
var ClipEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ClipEvents.setMaxListeners(0);

// Model events
var events = {
  'afterCreate': 'save',
  'afterUpdate': 'save',
  'afterDestroy': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Clip.hook(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc, options, done) {
    ClipEvents.emit(event + ':' + doc._id, doc);
    ClipEvents.emit(event, doc);
    done(null);
  }
}

export default ClipEvents;
