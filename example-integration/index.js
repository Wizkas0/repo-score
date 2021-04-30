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
  const minWordCount = parseInt(
    core.getInput("min-word-count", { required: true })
  );
  const scores = commitsList.reduce((scores, commit) => {
    const author = commit.author.username;
    const message = commit.message;
    const words = message.split(/\w+/);
    console.log("--- Words:");
    console.log(words);
    const score = words.length - minWordCount;
    return scores.has(author)
      ? scores.set(author, scores.get(author) + score)
      : scores.set(author, score);
  }, new Map());
  console.log("--- Scores:");
  console.log(scores);
  return scores;
}
