/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 105:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 82:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(105);
const github = __nccwpck_require__(82);

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
    console.log("scoreboard issue number %s", scoreboardId)
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

async function updateScoreboard(client, owner, repo, id) {

}

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

})();

module.exports = __webpack_exports__;
/******/ })()
;