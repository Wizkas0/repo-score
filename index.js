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

    const newScores = JSON.parse(core.getInput("new-scores"));
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
  /*
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
  return issue.data.body.split("\r\n").reduce((map, row) => {
    const match = rowRegex.exec(row);
    map.set(match[1], match[2]);
    return map;
  }, new Map());
}

async function updateScoreboard(client, issueNumber, newScores, currentScores) {
  const issueBody = createIssueBody();
  await client.issues.update({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: issueNumber,
    body: issueBody,
  });
}

function createIssueBody() {
  return "1. m4reko: 10\n2. Wizkas0: 5";
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
