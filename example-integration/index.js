const core = require("@actions/core");
const github = require("@actions/github");

function run() {
  console.log("--- context commit length:");
  console.log(github.context.payload.commits.length);
  core.setOutput("scores", '{"m4reko": 50, "evert": 10}');
}
run();
