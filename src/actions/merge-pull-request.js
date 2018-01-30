import { logInfo, logTaskStart, logWarn } from '../log';

const MERGE_PULL_REQUEST = 'MERGE_PULL_REQUEST';

const mergePullRequest = ({ getters, state }, isSkipped) => {
  logTaskStart('Merge pull request');

  if (isSkipped) {
    return undefined;
  }

  logInfo(`Merging pull request #${state.data.number}...`);

  if (state.data.isMerged) {
    return logWarn('Pull request already merged.');
  }
  if (!state.data.isMergeable) {
    return Promise.reject('Pull request non-mergeable!');
  }

  return getters.github.pullRequests.merge({
    message: state.data.message,
    method: state.data.method,
    number: state.data.number
  })
    .then(({ url }) => logInfo(url));
};

export { MERGE_PULL_REQUEST };
export default mergePullRequest;
