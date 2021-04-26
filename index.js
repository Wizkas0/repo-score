const core = require('@actions/core')
const github = require('@actions/github');

const some_input = core.getInput("some input", { required: false })



async function run() {
  // this is the main function run by the label-generating action
  try {
  const token = core.getInput("repo-token", { required: true }); // the token used for authentication
  const client = new github.getOctokit(token);
  const prNr = github.context.payload.number; // the issue-number of the PR
  const prTitle = github.context.payload.pull_request.title; // the title of the PR
  var scoreboard_id;
  var scoreboard = await client.issues.listForRepo({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    labels: "Scoreboard",
  });
  console.log(scoreboard);
  if (scoreboard.data.length() === 0){
    scoreBoard_id = await make_scoreBoard(client, "Scoreboard")
  }
  else{
    scoreBoard_id = scoreboard.data.id
  }
  } catch (error) {
  core.setFailed(error.message);
  console.log(error);
  }
}
async function make_scoreBoard(client, title) {
  const issue = await client.issues.create({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    title: title,
  });

  console.log(issue)
  const id = issue.data.node_id
  console.log(id)
  await client.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: prNumber,
    labels: "Scoreboard"
  });
  const pinned = await pinIssue(client, id)
  return issue.data.id
}

async function update_scoreBoard(client, owner, repo, id) {

}

async function pinIssue (octokit, id) {
  const pinIssue = `
  mutation comment($id: ID!) {
    pinIssue(input: {issueId: $id}) {
      clientMutationId
    }
  }
`;
  const pinnn = await octokit.graphql(pinIssue, {
    id: id,
    input: {issueId: id},
    headers: {
      accept: "application/vnd.github.elektra-preview+json",
    },
  });
  console.log(pinnn)
}

/*
function genLabels(prTitle){
  // this function generates labels from keywords found in PR-title
  prTitle = prTitle.toLowerCase();
  var labels = []; // labels to be added to PR
  for(const keyword in label_dict) {
    if(prTitle.includes(keyword)) {
      labels.push(label_dict[keyword]);
    }
  }
  return labels;
}
*/
run();
