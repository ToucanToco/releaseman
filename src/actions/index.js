import alphaAuto, { ALPHA_AUTO } from './alpha-auto'
import alphaAutoFix, { ALPHA_AUTO_FIX } from './alpha-auto-fix'
import alphaAutoRelease, { ALPHA_AUTO_RELEASE } from './alpha-auto-release'
import alphaFix, { ALPHA_FIX } from './alpha-fix'
import alphaRelease, { ALPHA_RELEASE } from './alpha-release'
import betaAuto, { BETA_AUTO } from './beta-auto'
import betaAutoFix, { BETA_AUTO_FIX } from './beta-auto-fix'
import betaAutoRelease, { BETA_AUTO_RELEASE } from './beta-auto-release'
import betaFix, { BETA_FIX } from './beta-fix'
import betaRelease, { BETA_RELEASE } from './beta-release'
import compare, { COMPARE } from './compare'
import createPullRequest, { CREATE_PULL_REQUEST } from './create-pull-request'
import createRelease, { CREATE_RELEASE } from './create-release'
import deleteBranch, { DELETE_BRANCH } from './delete-branch'
import findPullRequest, { FIND_PULL_REQUEST } from './find-pull-request'
import getBranch, { GET_BRANCH } from './get-branch'
import getChangelog, { GET_CHANGELOG } from './get-changelog'
import getHelp, { GET_HELP } from './get-help'
import getLatestRelease, { GET_LATEST_RELEASE } from './get-latest-release'
import getLatestTag, { GET_LATEST_TAG } from './get-latest-tag'
import getPullRequest, { GET_PULL_REQUEST } from './get-pull-request'
import getTag, { GET_TAG } from './get-tag'
import mergeBranches, { MERGE_BRANCHES } from './merge-branches'
import mergePullRequest, { MERGE_PULL_REQUEST } from './merge-pull-request'
import runCommand, { RUN_COMMAND } from './run-command'
import runContinue, { RUN_CONTINUE } from './run-continue'
import runTask, { RUN_TASK } from './run-task'
import saveState, { SAVE_STATE } from './save-state'
import skipTask, { SKIP_TASK } from './skip-task'
import stableAuto, { STABLE_AUTO } from './stable-auto'
import stableAutoFix, { STABLE_AUTO_FIX } from './stable-auto-fix'
import stableAutoRelease, { STABLE_AUTO_RELEASE } from './stable-auto-release'
import stableFix, { STABLE_FIX } from './stable-fix'
import stableRelease, { STABLE_RELEASE } from './stable-release'
import start, { START } from './start'
import updatePullRequest, { UPDATE_PULL_REQUEST } from './update-pull-request'
import updatePullRequestLabels, {
  UPDATE_PULL_REQUEST_LABELS
} from './update-pull-request-labels'

const actions = {
  [ALPHA_AUTO]: alphaAuto,
  [ALPHA_AUTO_FIX]: alphaAutoFix,
  [ALPHA_AUTO_RELEASE]: alphaAutoRelease,
  [ALPHA_FIX]: alphaFix,
  [ALPHA_RELEASE]: alphaRelease,
  [BETA_AUTO]: betaAuto,
  [BETA_AUTO_FIX]: betaAutoFix,
  [BETA_AUTO_RELEASE]: betaAutoRelease,
  [BETA_FIX]: betaFix,
  [BETA_RELEASE]: betaRelease,
  [COMPARE]: compare,
  [CREATE_PULL_REQUEST]: createPullRequest,
  [CREATE_RELEASE]: createRelease,
  [DELETE_BRANCH]: deleteBranch,
  [FIND_PULL_REQUEST]: findPullRequest,
  [GET_BRANCH]: getBranch,
  [GET_CHANGELOG]: getChangelog,
  [GET_HELP]: getHelp,
  [GET_LATEST_RELEASE]: getLatestRelease,
  [GET_LATEST_TAG]: getLatestTag,
  [GET_PULL_REQUEST]: getPullRequest,
  [GET_TAG]: getTag,
  [MERGE_BRANCHES]: mergeBranches,
  [MERGE_PULL_REQUEST]: mergePullRequest,
  [RUN_COMMAND]: runCommand,
  [RUN_CONTINUE]: runContinue,
  [RUN_TASK]: runTask,
  [SAVE_STATE]: saveState,
  [SKIP_TASK]: skipTask,
  [STABLE_AUTO]: stableAuto,
  [STABLE_AUTO_FIX]: stableAutoFix,
  [STABLE_AUTO_RELEASE]: stableAutoRelease,
  [STABLE_FIX]: stableFix,
  [STABLE_RELEASE]: stableRelease,
  [START]: start,
  [UPDATE_PULL_REQUEST]: updatePullRequest,
  [UPDATE_PULL_REQUEST_LABELS]: updatePullRequestLabels
}

export {
  ALPHA_AUTO,
  ALPHA_AUTO_FIX,
  ALPHA_AUTO_RELEASE,
  ALPHA_FIX,
  ALPHA_RELEASE,
  BETA_AUTO,
  BETA_AUTO_FIX,
  BETA_AUTO_RELEASE,
  BETA_FIX,
  BETA_RELEASE,
  COMPARE,
  CREATE_PULL_REQUEST,
  CREATE_RELEASE,
  DELETE_BRANCH,
  FIND_PULL_REQUEST,
  GET_BRANCH,
  GET_CHANGELOG,
  GET_HELP,
  GET_LATEST_RELEASE,
  GET_LATEST_TAG,
  GET_PULL_REQUEST,
  GET_TAG,
  MERGE_BRANCHES,
  MERGE_PULL_REQUEST,
  RUN_COMMAND,
  RUN_CONTINUE,
  RUN_TASK,
  SAVE_STATE,
  SKIP_TASK,
  STABLE_AUTO,
  STABLE_AUTO_FIX,
  STABLE_AUTO_RELEASE,
  STABLE_FIX,
  STABLE_RELEASE,
  START,
  UPDATE_PULL_REQUEST,
  UPDATE_PULL_REQUEST_LABELS
}
export default actions
