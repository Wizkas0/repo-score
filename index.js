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
  await make_scoreBoard(client, "Scoreboard")
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
  /*
  const issues = await client.issues.listForRepo({
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
});
  console.log(issues)
  var id;
  for (const issue in issues) {
    if (issue.title === "Scoreboard"){
      id = issue.id
    }
  }
  */
  console.log(issue)
  const id = issue.data.node_id
  console.log(id)
  const pinned = await pinIssue(client, id)
}

async function update_scoreBoard(client, owner, repo, id) {

}

async function pinIssue (octokit, id) {
  const pinIssue = `
  mutation comment($id: ID!) {
    pinIssue(PinIssueInput: {issueId: $id}) {
      clientMutationId
    }
  }
`;
  const pinnn = await octokit.graphql(pinIssue, {
    id: id,
    Input: {issueId: id},
    headers: {
      accept: "application/vnd.github.elektra-preview+json",
    },
  });
  console.log(pinnn)
}

/*
async function addLabels(client, prNumber, prTitle, labels) {
  // this function adds labels to a PR
  if(labels.length === 0) {
    console.log("No matching labels found, exiting"); // no keywords/keyphrases were found in the title of the PR
    return;
  }
  console.log("Found matching labels:", labels);
  await client.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: prNumber,
    labels: labels
  });
}

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
