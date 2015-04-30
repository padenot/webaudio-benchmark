var OUTPUT_PATH="webaudio.json";

var benchmarks = require("./benchmarks.js");
var template = require("./template-row.json");
var dashboard = require("./webaudio-dashboard.json");
var fs = require('fs');

var str = JSON.stringify(template);

var names = benchmarks.benchmarks;
for (var i in benchmarks.benchmarks) {
  dashboard.rows.push(JSON.parse(str.replace(/{{}}/g, names[i])));
}

fs.writeFile(OUTPUT_PATH, JSON.stringify(dashboard, " ", 2), function(err) {
  if(err) {
    return console.log(err);
  }

  console.log("grafana dashboard saved as " + OUTPUT_PATH);
});
