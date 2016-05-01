var fs = require('fs');
var child_process = require('child_process');
var path = require('path');

import { User,
         Project,
         UserCollabProject,
         Clip,
         Song } from './sqldb';

import config from "./config/environment"

var makeSong = function(song, callback) {
  console.log(__dirname);
  var sid = song._id;
  return song.getProject()
    .then((proj) => {
      var projLoc = path.join(config.root, config.diffSync.projectJSONDirectory, proj._id + '.json');
      var projData = JSON.parse(fs.readFileSync(projLoc, 'utf8'));
      // get clips with ids, length, start by track

      /*
        { tracks: {
          "0": {
            id, name, clips: { "0":{ start, length, id}, "1": {..}.. }
          }
        }
       */

      var tracksObj = projData.tracks;
      console.log(projLoc);
      console.log(JSON.stringify(projData));
      var tracks = Object.keys(tracksObj).map(key => tracksObj[key]);
      for(var track of tracks) {
        if(!track.clips) continue;
        var clipsObj = track.clips;
        var clipsUnordered = Object.keys(clipsObj).map(key => clipsObj[key]);
  var clips = clipsUnordered.sort(function(a, b) {
      if(a.start < b.start) return -1;
      if(a.start > b.start) return 1;
      else return 0;
  });

        console.log(clips);
        // convert each to 32khz sample rate
        clips.forEach(c => {
          child_process.exec('sox clipStorage/' + c.id + '.wav -r 32000 /tmp/clip.' + c.id + '.wav && cp /tmp/clip.' + c.id + '.wav clipStorage/' + c.id + '.wav', {cwd: config.root});
        });

        if(clips.length == 0) continue;
        if(clips.length == 1) {
          var clip = clips[0];

          var cmd = 'sox clipStorage/' + clip.id + '.wav -p pad ' + measToTime(clip.start) + ' 0 | sox - -r 32000 /tmp/' + sid + track.id + '.wav';
          console.log('1 clip: exec ' + cmd)
          child_process.exec(cmd, {cwd: config.root});
          continue;
        }
        // concat all clips in a track with padding as:
        // sox clip1.wav -p pad 0 3 | sox - clip2.wav t2.wav
        // first clip added specially
        var curMeas = clips[0].length;
        var cmd = 'sox clipStorage/' + clips[0].id + '.wav -p pad ' + measToTime(clips[0].start) + ' ' + (measToTime(clips[1].start - curMeas)); // pad with silence betwen clips
        for(var i = 1; i < clips.length -1; i++) { // from 2nd to 2nd to last
          console.log(clips[i]);
          curMeas += clips[i].length;
          cmd += ' | sox - clipStorage/' + clips[i].id + '.wav -p pad 0 ' + (measToTime(clips[i+1].start - curMeas));
        }
        if(clips.length >= 2) {
          cmd += ' | sox - clipStorage/' + clips[clips.length-1].id + '.wav /tmp/' + sid + track.id + '.wav'; // store new track in /tmp
        }
        else {
          cmd += ' | sox - /tmp/' + sid + track.id + '.wav'; // store new track in /tmp'
        }

        console.log(cmd);
        child_process.exec(cmd, {cwd: config.root}, function(err, stdout, stderr) {
          track.successful = true;
          console.log('concated clips in track');
          if(err) {
            console.log(err);
          }
          else {

          }
        });
      }

      console.log(tracks);

      // merge all tracks with:
      //  sox -m t1.wav t2.wav song.wav
      var cmd = ''; //'sox -m ';
      var numTracksWithAudio = 0;
      for(var track of tracks) {
        console.log(JSON.stringify(track));
        var clipsObj = track.clips;
        if(!clipsObj || clipsObj == {}) continue;
        var clips = Object.keys(clipsObj).map(key => clipsObj[key]);

        if(clips.length > 0) {
          cmd += ' /tmp/' + sid + track.id + '.wav';
          numTracksWithAudio++;
        }
      }

      if(numTracksWithAudio < 2) {
        cmd = 'cp ' + cmd + ' songStorage/' + sid + '.wav';
      }
      else {
        cmd = 'sox -m ' + cmd + ' songStorage/' + sid + '.wav';
      }

      console.log(cmd);
      child_process.exec(cmd, {cwd: config.root}, function(err, stdout, stderr) {
        if(err) {
          console.log(err);
        }
        else {
          console.log('song saved');
          song.pathToFile = 'songStorage/' + sid + '.wav';
          song.save();
          callback(null);
        }
      });

    });
};


function measToTime(n) {
  // 120 b/min, 4b/meas
  return n * ((4.0/120.0) * 60.0);
}

module.exports = makeSong;
