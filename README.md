<div align="center">
<img src="logo.gif" alt="Logo" width="40%"/>
</div>

# Repo Score

The flexible GitHub contribution scoreboard that motivates open source contributors to excel in any way you want.

Repo Score lets you create workflows that integrate your existing actions with the scoreboard functionality with the goal to encourage your contributors to make stellar contributions. The rules on how contributions should be rewarded with points are entirely up to you to decide. Repo Score features an extremely simple API that lets you integrate any action either directly, or with some simple conversion.

## Usage

### Workflow file

Create a workflow file in your project (for example `.github/workflows/main.yml`)
to use the action in your project.

```
name: main

on: [push]

jobs:
  score-commits:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Example integration
      id: commit-scores
      uses: ./example-integration
      with:
        min-word-count: "5"
    - uses: Wizkas0/repo-score@main
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
        new-scores: ${{ steps.commit-scores.outputs.scores }}
```

### Repo Score API

The Repo Score action takes a string formatted as a json object with pairs of names and scores, for example `{"Wizkas0": 10, "m4reko": 15}`
and uses this to update the scoreboard by adding the new scores to the current scores. You can define your own scoring action that scores users on a given type of GitHub activity, and
returns the calculated scores as an output. You then run the the Repo Score action as a step after your scoring action with this input as
the `new-scores` input.

### Inputs

| Name       | Description                                                                                                  | Required |
| ---------- | ------------------------------------------------------------------------------------------------------------ | -------- |
| repo-token | Token necessary to allow the action to make changes in the repo. The pre-defined GITHUB_TOKEN is often used. | Yes      |
| new-scores | A string formatted as a json object with pairs of names and scores to be added to the scoreboard.             | Yes      |

### Example integration
This repo contains an example scoring action, called commit-scores, that scores users based on the word-counts of their commit-messages.
It takes the input `min-word-count`, which defines the minimum number of words in a commit message that awards points. In the example workflow above,
each additional word after the fifth awards one point. Five words or less awards no points.

If you want to try out the Repo Score action, you can fork this repository and push some commits to your fork.
