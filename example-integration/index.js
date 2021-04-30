const core = require("@actions/core");
const github = require("@actions/github");

function run() {
  console.log("--- Context commit length:");
  console.log(github.context.payload.commits.length);
  const scores = calculateScores(github.context.commits);
  core.setOutput("scores", JSON.stringify(Object.fromEntries(scores)));
}
run();

function calculateScores(commitsList) {
  const scores = new Map();
  const minWordCount = parseInt(
    core.getInput("min-word-count", { required: true })
  );
  for (const commit in commitsList) {
    const author = commit.author.username;
    const message = commit.message;
    const words = message.split(/\w+/);
    console.log("--- Words:");
    console.log(words);
    const score = words.length - minWordCount;
    if (scores.has(author)) scores.set(author, scores.get(author) + score);
    else scores.set(author, score);
  }
  console.log("--- Scores:");
  console.log(scores);
  return scores;
}
