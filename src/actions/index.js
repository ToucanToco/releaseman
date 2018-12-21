import createBranch, { CREATE_BRANCH } from './create-branch';
import createLabels, { CREATE_LABELS } from './create-labels';
import createPullRequest, { CREATE_PULL_REQUEST } from './create-pull-request';
import createRelease, { CREATE_RELEASE } from './create-release';
import deleteBranch, { DELETE_BRANCH } from './delete-branch';
import findReleasePullRequest, {
  FIND_RELEASE_PULL_REQUEST
} from './find-release-pull-request';
import getBranchExistence, {
  GET_BRANCH_EXISTENCE
} from './get-branch-existence';
import getChangelog, { GET_CHANGELOG } from './get-changelog';
import getLabels, { GET_LABELS } from './get-labels';
import getLatestRelease, { GET_LATEST_RELEASE } from './get-latest-release';
import getNextRelease, { GET_NEXT_RELEASE } from './get-next-release';
import getPullRequest, { GET_PULL_REQUEST } from './get-pull-request';
import getPullRequestLabels, {
  GET_PULL_REQUEST_LABELS
} from './get-pull-request-labels';
import getReleaseBranch, { GET_RELEASE_BRANCH } from './get-release-branch';
import getReleasesExistence, {
  GET_RELEASES_EXISTENCE
} from './get-releases-existence';
import mergeBranches, { MERGE_BRANCHES } from './merge-branches';
import mergePullRequest, { MERGE_PULL_REQUEST } from './merge-pull-request';
import run, { RUN } from './run';
import runChanges, { RUN_CHANGES } from './run-changes';
import runContinue, { RUN_CONTINUE } from './run-continue';
import runFeature, { RUN_FEATURE } from './run-feature';
import runFeatureFinish, { RUN_FEATURE_FINISH } from './run-feature-finish';
import runFeaturePublish, { RUN_FEATURE_PUBLISH } from './run-feature-publish';
import runFeatureStart, { RUN_FEATURE_START } from './run-feature-start';
import runFix, { RUN_FIX } from './run-fix';
import runFixFinish, { RUN_FIX_FINISH } from './run-fix-finish';
import runFixPublish, { RUN_FIX_PUBLISH } from './run-fix-publish';
import runFixStart, { RUN_FIX_START } from './run-fix-start';
import runHelp, { RUN_HELP } from './run-help';
import runHotfix, { RUN_HOTFIX } from './run-hotfix';
import runHotfixFinish, { RUN_HOTFIX_FINISH } from './run-hotfix-finish';
import runHotfixPublish, { RUN_HOTFIX_PUBLISH } from './run-hotfix-publish';
import runHotfixStart, { RUN_HOTFIX_START } from './run-hotfix-start';
import runInit, { RUN_INIT } from './run-init';
import runRelease, { RUN_RELEASE } from './run-release';
import runReleaseFinish, { RUN_RELEASE_FINISH } from './run-release-finish';
import runReleaseStart, { RUN_RELEASE_START } from './run-release-start';
import runTask, { RUN_TASK } from './run-task';
import saveState, { SAVE_STATE } from './save-state';
import skipTask, { SKIP_TASK } from './skip-task';
import start, { START } from './start';
import updatePullRequest, { UPDATE_PULL_REQUEST } from './update-pull-request';
import updatePullRequestLabels, {
  UPDATE_PULL_REQUEST_LABELS
} from './update-pull-request-labels';

const actions = {
  [CREATE_BRANCH]: createBranch,
  [CREATE_LABELS]: createLabels,
  [CREATE_PULL_REQUEST]: createPullRequest,
  [CREATE_RELEASE]: createRelease,
  [DELETE_BRANCH]: deleteBranch,
  [FIND_RELEASE_PULL_REQUEST]: findReleasePullRequest,
  [GET_BRANCH_EXISTENCE]: getBranchExistence,
  [GET_CHANGELOG]: getChangelog,
  [GET_LABELS]: getLabels,
  [GET_LATEST_RELEASE]: getLatestRelease,
  [GET_NEXT_RELEASE]: getNextRelease,
  [GET_PULL_REQUEST]: getPullRequest,
  [GET_PULL_REQUEST_LABELS]: getPullRequestLabels,
  [GET_RELEASE_BRANCH]: getReleaseBranch,
  [GET_RELEASES_EXISTENCE]: getReleasesExistence,
  [MERGE_BRANCHES]: mergeBranches,
  [MERGE_PULL_REQUEST]: mergePullRequest,
  [RUN]: run,
  [RUN_CHANGES]: runChanges,
  [RUN_CONTINUE]: runContinue,
  [RUN_FEATURE]: runFeature,
  [RUN_FEATURE_FINISH]: runFeatureFinish,
  [RUN_FEATURE_PUBLISH]: runFeaturePublish,
  [RUN_FEATURE_START]: runFeatureStart,
  [RUN_FIX]: runFix,
  [RUN_FIX_FINISH]: runFixFinish,
  [RUN_FIX_PUBLISH]: runFixPublish,
  [RUN_FIX_START]: runFixStart,
  [RUN_HELP]: runHelp,
  [RUN_HOTFIX]: runHotfix,
  [RUN_HOTFIX_FINISH]: runHotfixFinish,
  [RUN_HOTFIX_PUBLISH]: runHotfixPublish,
  [RUN_HOTFIX_START]: runHotfixStart,
  [RUN_INIT]: runInit,
  [RUN_RELEASE]: runRelease,
  [RUN_RELEASE_FINISH]: runReleaseFinish,
  [RUN_RELEASE_START]: runReleaseStart,
  [RUN_TASK]: runTask,
  [SAVE_STATE]: saveState,
  [SKIP_TASK]: skipTask,
  [START]: start,
  [UPDATE_PULL_REQUEST]: updatePullRequest,
  [UPDATE_PULL_REQUEST_LABELS]: updatePullRequestLabels
};

export {
  CREATE_BRANCH,
  CREATE_LABELS,
  CREATE_PULL_REQUEST,
  CREATE_RELEASE,
  DELETE_BRANCH,
  FIND_RELEASE_PULL_REQUEST,
  GET_BRANCH_EXISTENCE,
  GET_CHANGELOG,
  GET_LABELS,
  GET_LATEST_RELEASE,
  GET_NEXT_RELEASE,
  GET_PULL_REQUEST,
  GET_PULL_REQUEST_LABELS,
  GET_RELEASE_BRANCH,
  GET_RELEASES_EXISTENCE,
  MERGE_BRANCHES,
  MERGE_PULL_REQUEST,
  RUN,
  RUN_CHANGES,
  RUN_CONTINUE,
  RUN_FEATURE,
  RUN_FEATURE_FINISH,
  RUN_FEATURE_PUBLISH,
  RUN_FEATURE_START,
  RUN_FIX,
  RUN_FIX_FINISH,
  RUN_FIX_PUBLISH,
  RUN_FIX_START,
  RUN_HELP,
  RUN_HOTFIX,
  RUN_HOTFIX_FINISH,
  RUN_HOTFIX_PUBLISH,
  RUN_HOTFIX_START,
  RUN_INIT,
  RUN_RELEASE,
  RUN_RELEASE_FINISH,
  RUN_RELEASE_START,
  RUN_TASK,
  SAVE_STATE,
  SKIP_TASK,
  START,
  UPDATE_PULL_REQUEST,
  UPDATE_PULL_REQUEST_LABELS
};
export default actions;
