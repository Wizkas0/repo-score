const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const token = core.getInput("repo-token", { required: true });
    const client = github.getOctokit(token);
    const scoreboardIssueList = await client.issues.listForRepo({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      labels: "Scoreboard",
    });
    console.log("--- Scoreboard issues:");
    console.log(scoreboardIssueList);

    const scoreboardIssueNumber =
      scoreboardIssueList.data.length === 0
        ? await makeScoreboard(client, "Scoreboard")
        : scoreboardIssueList.data[0].number;
    console.log("scoreboard issue number %s", scoreboardIssueNumber);

    const currentScores = await parseScoreboard(client, scoreboardIssueNumber);
    console.log("--- Current scores:");
    console.log(currentScores);

    const input = core.getInput("new-scores");
    console.log("--- Input:");
    console.log(input);
    const newScores = new Map(Object.entries(JSON.parse(input)));
    console.log("--- New scores:");
    console.log(newScores);

    await updateScoreboard(
      client,
      scoreboardIssueNumber,
      newScores,
      currentScores
    );
  } catch (error) {
    core.setFailed(error.message);
    console.log(error);
  }
}

async function makeScoreboard(client, title) {
  const issue = await client.issues.create({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    title: title,
  });
  console.log("--- Issue:");
  console.log(issue);
  const id = issue.data.node_id;
  const issueNumber = issue.data.number;
  await client.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: issueNumber,
    labels: ["Scoreboard"],
  });
  await pinIssue(client, id);
  return issueNumber;
}

async function parseScoreboard(client, issueNumber) {
  /* Syntax of scoreboard:
  These are the top contributors of this repo.

  1. m4reko: 10
  2. Wizkas0: 5
  */
  const issue = await client.issues.get({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: issueNumber,
  });
  console.log("--- Issue:");
  console.log(issue);

  const rowRegex = /^\d+\. (.+): (\d+)$/;
  return issue.data.body.split(/\r?\n/).reduce((map, row) => {
    const match = row.match(rowRegex);
    return match ? map.set(match[1], parseInt(match[2])) : map;
  }, new Map());
}

async function updateScoreboard(client, issueNumber, newScores, currentScores) {
  const updatedScores = calculateScores(currentScores, newScores);
  const issueBody = createIssueBody(updatedScores);
  await client.issues.update({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: issueNumber,
    body: issueBody,
  });
}

function createIssueBody(scores) {
  const ingress = "These are the the top contributors of this repository.\n\n";
  return (
    ingress +
    [...scores]
      .sort(([_a, a], [_b, b]) => b - a)
      .map(([username, score], index) => `${index + 1}. ${username}: ${score}`)
      .join("\n")
  );
}

function calculateScores(currentScores, newScores) {
  console.log("--- New scores:");
  console.log(newScores);
  [...newScores].forEach(([user, newScore]) => {
    if (currentScores.has(user))
      currentScores.set(user, currentScores.get(user) + newScore);
    else currentScores.set(user, newScore);
  });
  return currentScores;
}

async function pinIssue(octokit, id) {
  const pinMutation = `
  mutation comment($id: ID!) {
    pinIssue(input: {issueId: $id}) {
      clientMutationId
    }
  }
`;
  await octokit.graphql(pinMutation, {
    id: id,
    input: { issueId: id },
    headers: {
      accept: "application/vnd.github.elektra-preview+json",
    },
  });
}

run();
