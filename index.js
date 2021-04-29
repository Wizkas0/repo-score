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
    await updateScoreboard(client, scoreboardIssueNumber);
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

async function updateScoreboard(client, issueNumber) {
  const issueBody = createIssueBody();
  await client.issues.update({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: issueNumber,
    body: issueBody,
  });
}

function createIssueBody() {
  return "Hello World";
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
