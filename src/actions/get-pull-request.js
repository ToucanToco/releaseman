import { ASSIGN_DATA } from '../mutations';
import { logInfo, logTaskStart } from '../log';

const GET_PULL_REQUEST = 'GET_PULL_REQUEST';

const getPullRequest = ({ commit, getters, state }, isSkipped) => {
  logTaskStart('Get pull request');

  if (isSkipped) {
    return undefined;
  }

  logInfo(`Retrieving pull request #${state.data.number}...`);

  return getters.github.pullRequests.get({ number: state.data.number })
    .then(({ base, head, isMergeable, isMerged, name }) => {
      logInfo(name);

      return commit(ASSIGN_DATA, {
        base: base,
        head: head,
        isMergeable: isMergeable,
        isMerged: isMerged,
        name: name
      });
    });
};

export { GET_PULL_REQUEST };
export default getPullRequest;
