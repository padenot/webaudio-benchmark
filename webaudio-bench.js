// Global samplerate at which we run the context.
var samplerate = 48000;
// Array containing at first the url of the audio resources to fetch, and the
// the actual buffers audio buffer we have at our disposal to for tests.
var sources = [];
// Array containing the results, for each benchmark.
var results = [];
// Array containing at first the function objects (before init), and then an
// object with the context on which we can call |startRendering| and the name of
// the testcase.
var testcases = [];

if (window.AudioContext == undefined) {
  window.AudioContext = window.webkitAudioContext;
  window.OfflineAudioContext = window.webkitOfflineAudioContext;
}

function getFile(url, callback) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  request.onload = function() {
    var ctx = new AudioContext();
    ctx.decodeAudioData(request.response, function(data) {
      callback(data, undefined);
    }, function() {
      callback(undefined, "Error decoding the file " + url);
    });
  }
  request.send();
}

function recordResult(result) {
  results.push(result);
}

function benchmark(testcase, ended) {
  var context = testcase.context;
  var start;

  context.oncomplete = function(b) {
    var ctx = new AudioContext();
    var node = ctx.createBufferSource();
    for (var i = 0; i < b.renderedBuffer.length; i++) {
      if (b.renderedBuffer.getChannelData(0)[i] != 0.0) {
        console.log(b.renderedBuffer.getChannelData(0)[i]);
      }
    }
    node.buffer = b.renderedBuffer;
    node.connect(ctx.destination);
    node.start(0);

    var end = Date.now();
    recordResult({
      name: testcase.name,
      duration: end - start
    });
    ended();
  };

  start = Date.now();
  context.startRendering();
}

function getMonoFile() {
  return getSpecificFile({numberOfChannels: 1});
}

function getStereoFile() {
  return getSpecificFile({numberOfChannels: 2});
}

function matchIfSpecified(a, b) {
  if (b) {
    return a == b;
  }
  return true;
}

function getSpecificFile(spec) {
  for (var i = 0 ; i < sources.length; i++) {
    if (matchIfSpecified(sources[i].numberOfChannels, spec.numberOfChannels) &&
        matchIfSpecified(sources[i].samplerate, spec.samplerate)) {
      return sources[i];
    }
  }
  throw new Error("Could not find a file that matches the specs.");
}

function displayResult(r) {

  return "<tr><td>" + r.name + "</td>" +
    "<td>" + r.duration + "</td></tr>";
}

function allDone() {
  document.getElementById("in-progress").style.display = "none";
  var result = document.getElementById("results");
  var str = ""
  str = "<table><tr><td>Test name</td><td>Time in ms</td></tr>";
  for (var i = 0 ; i < results.length; i++) {
    str += displayResult(results[i]);
  }
  str += "</table>";
  result.innerHTML = str;
}

function runOne(i) {
  benchmark(testcases[i], function() {
    i++;
    if (i < testcases.length) {
      runOne(i);
    } else {
      allDone();
    }
  });
}

function runAll(testcases) {
  results = [];
  runOne(0);
}

function initAll() {
  for (var i = 0; i < testcases.length; i++) {
    testcases[i] = testcases[i]();
  }
}

function loadOne(i, endCallback) {
  getFile(sources[i], function(b) {
    sources[i] = b;
    i++;
    if (i == sources.length) {
      loadOne(i);
    } else {
      endCallback();
    }
  })
}

function loadAllSources(endCallback) {
  loadOne(0, endCallback);
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("run-all").addEventListener("click", function() {
    document.getElementById("in-progress").style.display = "block";
    runAll();
  });
  loadAllSources(function() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("run-all").style.display = "block";
    initAll();
  });
});

/* Public API */
function registerTestCase(testCase) {
  testcases.push(testCase);
}

function registerTestFile(url) {
  sources.push(url);
}
