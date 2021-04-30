const core = require("@actions/core");
const github = require("@actions/github");

function run() {
  console.log("--- Github context:");
  console.log(github.context);
  core.setOutput("scores", '{"m4reko": 50, "evert": 10}');
}
run();
