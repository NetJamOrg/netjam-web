var app = angular.module('netJamApp');

/* Profile CONTROLER */
app.controller('ProjectK', ['$scope', '$http', '$uibModalInstance', 'DiffSyncService', '$stateParams', function($scope, $http, $uibModalInstance, DiffSyncService, $stateParams) {

  var lastBlob;
  var lastClipLength = -1;
  var lastClipID = -1;

  // $http({
  //     method: "GET",
  //     url: 'assets/snd/good.wav'
  // }).then(function() {
  //     console.log('success');
  // });

  $scope.diffSync = DiffSyncService;
  $scope.project = $scope.diffSync.data;
  $scope.ctrackindex = 0;
  $scope.ctrackval = Object.getOwnPropertyNames($scope.project.tracks)[0];
  var numTracks = Object.getOwnPropertyNames($scope.project.tracks).length;

  $scope.incrTrack = function() {
    console.log($scope.ctrackindex);
    console.log($scope.ctrackval);
    console.log(Object.getOwnPropertyNames($scope.project.tracks));
    console.log('incr clicked');
    $scope.ctrackindex++;
    if($scope.ctrackindex >= numTracks) {
      $scope.ctrackindex = $scope.ctrackindex%numTracks;
    }
    $scope.ctrackval = Object.getOwnPropertyNames($scope.project.tracks)[$scope.ctrackindex];
  }

  function addClip (clipID, trackID, clipLength) {
    if(lastClipID < 0 || lastClipLength < 0) {
      return -1;
    }
    else {
      console.log($scope.project);
      var spot = firstOpen($scope.project.tracks[trackID], clipLength, $scope.project.length);
      if(spot >= 0 ) {
        var tmp = 0;
        if($scope.project.tracks[trackID].clips) {
          tmp = Object.getOwnPropertyNames(
            $scope.project.tracks[trackID].clips).length - 1;
          tmp = Object.getOwnPropertyNames(
            $scope.project.tracks[trackID].clips)[tmp];
          if(tmp ===  undefined || tmp === null) {
            tmp = -1;
          }
          tmp = parseInt(tmp) + 1;
        }
        else {
          $scope.project.tracks[trackID].clips = {};
        }

        var data = {
          start: spot,
          length: clipLength,
          id: clipID
        };
        $scope.project.tracks[trackID].clips[tmp] = data;
        console.log("added clip " + JSON.stringify({
          start: spot,
          length: clipLength,
          id: clipID
        }));
        console.log($scope.project);
        return 1;
      }
      else {
        console.log("no spot for clip");
        return -1;
      }
    }
  }

  // Finds first open spot long enough for track
  // TODO: Test
  function firstOpen(track, clength, projlength) {
    console.log('firstOpen');
    console.log(projlength);
    var spaces = new Array(projlength);
    console.log(track);
    var clipnum;
    if(track.clips) {
      clipnum = Object.getOwnPropertyNames(track.clips).length;
    }
    else {
      clipnum = 0;
    }
    for(var i=0; i<clipnum; i++) {
      console.log(track.clips[i]);
      var cstart = track.clips[i].start
      var clen = track.clips[i].length;

      for(var j=cstart; j<cstart+clen; j++) {
        spaces[j] = 1;
      }
    }

    var fit = true;
    for(var i=0; i<projlength; i++) {
      fit = true;
      if(!spaces[i]) {
        for(var j=0; j<clength; j++) {
          if(spaces[i+j])
            fit = false;
        }
        if(fit) {
          return i;
        }
      }
    }
    return -1;
  }

  $scope.ok = function() {
    //$uibModalInstance.close('closed');
    // $uibModalInstance.close({
    //     length:lastClipLength,
    //     id: lastClipID,
    //     flag: true
    // });

    if(addClip(lastClipID, $scope.ctrackval, lastClipLength) < 0) {
      console.log('clip upload failed ' + lastClipID + ' ' + $scope.ctrackval + ' ' + lastClipLength);
    }
    else {
      console.log('clip upload success');
    }
    DiffSyncService.update();
    $uibModalInstance.dismiss('cancel');
  };

  $scope.testFunc = function() {
    console.log("success");
  };

  $scope.uploadFile = function() {
    console.log("lastBlob loaded");

    if (lastBlob) {

      var fr = new FileReader();
      fr.onload = function(event) {
        var fd = {};
        fd['name'] = (new Date).getTime();
        fd['file'] = event.target.result;

        var req = {
          /*headers: {
          // X-XSRF-TOKEN: XSRF-TOKEN
          },*/
          method: "POST",
          url: '/api/projects/' + $stateParams.projectId + '/clip',
          // data: {
          //     'name': 'staticstring',
          //     'file': lastBlob
          // },
          data: fd,
          processData: false,
          contentType: false
        }

        $http(req).then(function(res) {
          // console.log('uploaded');
          // console.log(res);
          lastClipID = res.data.id;
          // firstOpen($scope.project.tracks[0], 5);
        })
      }

      fr.readAsDataURL(lastBlob);
    } else {
      alert("No blob recorded");
    }
  };

  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  var audioContext = new AudioContext();
  var audioInput = null;
  var realAudioInput = null;
  var inputPoint = null;
  var audioRecorder = null;
  var rafID = null;
  var analyserContext = null;
  var canvasWidth, canvasHeight;
  var recIndex = 0;
  var lastBlob = null;
  var analyserNode;
  var zeroGain;
  var clicktrack = new Audio("assets/snd/120bpmcrop.ogg");
  var lastStart = null;
  var msPerBeat = 2000; // beat = measure here lol

  $scope.recording = false;

  $scope.startRecording = function() {
    if ($scope.recording) {
      $scope.recording = !$scope.recording;
      // stop recording
      // pad sound;
      var check2 = function() {
        var t0 = (new Date()).getTime();
        if ((t0 - lastStart) % msPerBeat <= msPerBeat/10) {
          audioRecorder.stop();
          $('#analyser')[0].style.background = '#202020';
          // e.classList.remove("recording");
          audioRecorder.getBuffers(gotBuffers);
          lastClipLength = Math.round((t0-lastStart-2000)/msPerBeat);
        } else {
          setTimeout(check2, 50);
        }
      }
      check2();

    } else {
      $scope.recording = !$scope.recording;
      // start recording
      if (!audioRecorder) {
        console.log("no audio recorder found");
        return;
      }
      audioRecorder.clear();
      clicktrack.play();

      lastStart = (new Date()).getTime();
      var check = function() {
        if ((new Date()).getTime() - lastStart >= 2000) {
          // console.log("recording started");
          $('#analyser')[0].style.background = '#800202';
          audioRecorder.record();
        } else {
          // console.log('looped');
          setTimeout(check, 50);
        }
      }
      check();
    }
  };


  function saveAudio() {
    audioRecorder.exportWAV(doneEncoding);
  }

  function gotBuffers(buffers) {
    var canvas = $("#wavedisplay")[0];

    drawBuffer(canvas.width, canvas.height, canvas.getContext('2d'), buffers[0]);

    // the ONLY time gotBuffers is called is right after a new recording is completed -
    // so here's where we should set up the download.
    audioRecorder.exportWAV(doneEncoding);
  }

  function doneEncoding(blob) {
    Recorder.setupDownload(blob, "myRecording" + ((recIndex < 10) ? "0" : "") + recIndex + ".wav");
    lastBlob = blob;
    // console.log(blob);
    // console.log(JSON.stringify(blob));
    recIndex++;
  }

  function convertToMono(input) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 0, 1);
    return merger;
  }

  function cancelAnalyserUpdates() {
    window.cancelAnimationFrame(rafID);
    rafID = null;
  }

  function updateAnalysers(time) {
    if (!analyserContext) {
      var canvas = document.getElementById("analyser");
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;
      analyserContext = canvas.getContext('2d');
    }

    // analyzer draw code here
    {
      var SPACING = 3;
      var BAR_WIDTH = 1;
      var numBars = Math.round(canvasWidth / SPACING);
      var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

      analyserNode.getByteFrequencyData(freqByteData);

      analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
      analyserContext.fillStyle = '#F6D565';
      analyserContext.lineCap = 'round';
      var multiplier = analyserNode.frequencyBinCount / numBars;

      // Draw rectangle for each frequency bin.
      for (var i = 0; i < numBars; ++i) {
        var magnitude = 0;
        var offset = Math.floor(i * multiplier);
        // gotta sum/average the block, or we miss narrow-bandwidth spikes
        for (var j = 0; j < multiplier; j++)
          magnitude += freqByteData[offset + j];
        magnitude = magnitude / multiplier;
        var magnitude2 = freqByteData[i * multiplier];
        analyserContext.fillStyle = "hsl( " + Math.round((i * 360) / numBars) + ", 100%, 50%)";
        analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
      }
    }

    rafID = window.requestAnimationFrame(updateAnalysers);
  }

  function toggleMono() {
    if (audioInput != realAudioInput) {
      audioInput.disconnect();
      realAudioInput.disconnect();
      audioInput = realAudioInput;
    } else {
      realAudioInput.disconnect();
      audioInput = convertToMono(realAudioInput);
    }

    audioInput.connect(inputPoint);
  }

  function gotStream(stream) {
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

    //    audioInput = convertToMono( input );

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect(analyserNode);

    audioRecorder = new Recorder(inputPoint);

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect(zeroGain);
    zeroGain.connect(audioContext.destination);
    updateAnalysers();
  }

  function initAudio() {
    if (!navigator.getUserMedia)
      navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!navigator.cancelAnimationFrame)
      navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
    if (!navigator.requestAnimationFrame)
      navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    navigator.getUserMedia({
      "audio": {
        "mandatory": {
          "googEchoCancellation": "false",
          "googAutoGainControl": "false",
          "googNoiseSuppression": "false",
          "googHighpassFilter": "false"
        },
        "optional": []
      },
    }, gotStream, function(e) {
      alert('Error getting audio');
      console.log(e);
    });
  }

  function drawBuffer(width, height, context, data) {
    var step = Math.ceil(data.length / width);
    var amp = height / 2;
    context.fillStyle = "red";
    context.clearRect(0, 0, width, height);
    for (var i = 0; i < width; i++) {
      var min = 1.0;
      var max = -1.0;
      for (var j = 0; j < step; j++) {
        var datum = data[(i * step) + j];
        if (datum < min)
          min = datum;
        if (datum > max)
          max = datum;
      }
      context.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
  }

  /*License (MIT)

    Copyright © 2013 Matt Diamond

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
    documentation files (the "Software"), to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
    to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of
    the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
    THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
    CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
    DEALINGS IN THE SOFTWARE.
  */

  (function(window) {

    var WORKER_PATH = 'assets/js/recorderWorker.js';

    var Recorder = function(source, cfg) {
      var config = cfg || {};
      var bufferLen = config.bufferLen || 4096;
      this.context = source.context;
      if (!this.context.createScriptProcessor) {
        this.node = this.context.createJavaScriptNode(bufferLen, 2, 2);
      } else {
        this.node = this.context.createScriptProcessor(bufferLen, 2, 2);
      }

      var worker = new Worker(config.workerPath || WORKER_PATH);
      worker.postMessage({
        command: 'init',
        config: {
          sampleRate: this.context.sampleRate
        }
      });
      var recording = false,
          currCallback;

      this.node.onaudioprocess = function(e) {
        if (!recording) return;
        worker.postMessage({
          command: 'record',
          buffer: [
            e.inputBuffer.getChannelData(0),
            e.inputBuffer.getChannelData(1)
          ]
        });
      }

      this.configure = function(cfg) {
        for (var prop in cfg) {
          if (cfg.hasOwnProperty(prop)) {
            config[prop] = cfg[prop];
          }
        }
      }

      this.record = function() {
        recording = true;
      }

      this.stop = function() {
        recording = false;
      }

      this.clear = function() {
        worker.postMessage({ command: 'clear' });
      }

      this.getBuffers = function(cb) {
        currCallback = cb || config.callback;
        worker.postMessage({ command: 'getBuffers' })
      }

      this.exportWAV = function(cb, type) {
        currCallback = cb || config.callback;
        type = type || config.type || 'audio/wav';
        if (!currCallback) throw new Error('Callback not set');
        worker.postMessage({
          command: 'exportWAV',
          type: type
        });
      }

      this.exportMonoWAV = function(cb, type) {
        currCallback = cb || config.callback;
        type = type || config.type || 'audio/wav';
        if (!currCallback) throw new Error('Callback not set');
        worker.postMessage({
          command: 'exportMonoWAV',
          type: type
        });
      }

      worker.onmessage = function(e) {
        var blob = e.data;
        currCallback(blob);
      }

      source.connect(this.node);
      this.node.connect(this.context.destination); // if the script node is not connected to an output the "onaudioprocess" event is not triggered in chrome.
    };

    Recorder.setupDownload = function(blob, filename) {
      var url = (window.URL || window.webkitURL).createObjectURL(blob);
      var link = document.getElementById("save");
      link.href = url;
      link.download = filename || 'output.wav';
    }

    window.Recorder = Recorder;

  })(window);

  initAudio();
}]);
/* profile controller */
