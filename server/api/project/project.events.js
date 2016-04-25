/**
 * Project model events
 */

'use strict';

import {EventEmitter} from 'events';
var Project = require('../../sqldb').Project;
var ProjectEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ProjectEvents.setMaxListeners(0);

// Model events
var events = {
  'afterCreate': 'save',
  'afterUpdate': 'save',
  'afterDestroy': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Project.hook(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc, options, done) {
    ProjectEvents.emit(event + ':' + doc._id, doc);
    ProjectEvents.emit(event, doc);
    done(null);
  }
}

export default ProjectEvents;
