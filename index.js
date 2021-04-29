const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const token = core.getInput("repo-token", { required: true });
    const client = github.getOctokit(token);
    const scoreboard = await client.issues.listForRepo({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      labels: "Scoreboard",
    });
    console.log(scoreboard);
    const scoreboardId =
      scoreboard.data.length === 0
        ? await makeScoreboard(client, "Scoreboard")
        : scoreboard.data.number;
    console.log(scoreboardId)
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

  console.log(issue);
  const id = issue.data.node_id;
  const issue_nmbr = issue.data.number;
  console.log(issue_nmbr);
  console.log(id);
  await client.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: issue_nmbr,
    labels: ["Scoreboard"],
  });
  await pinIssue(client, id);
  return issue_nmbr;
}

async function updateScoreboard(client, owner, repo, id) {}

async function pinIssue(octokit, id) {
  const pinMutation = `
  mutation comment($id: ID!) {
    pinIssue(input: {issueId: $id}) {
      clientMutationId
    }
  }
`;
  const pinnn = await octokit.graphql(pinMutation, {
    id: id,
    input: { issueId: id },
    headers: {
      accept: "application/vnd.github.elektra-preview+json",
    },
  });
  console.log(pinnn);
}

run();
