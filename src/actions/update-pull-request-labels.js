import { toReadableList } from '../helpers';
import { logInfo, logTaskStart } from '../log';

const UPDATE_PULL_REQUEST_LABELS = 'UPDATE_PULL_REQUEST_LABELS';

const updatePullRequestLabels = ({ getters, state }, isSkipped) => {
  logTaskStart('Update pull request labels');

  if (isSkipped) {
    return undefined;
  }

  logInfo(`Setting pull request #${
    state.data.number
  } labels to ${
    toReadableList(state.data.labels)
  }...`);

  return getters.github.pullRequests.setLabels({
    labels: state.data.labels,
    number: state.data.number
  })
    .then(({ url }) => logInfo(url));
};

export { UPDATE_PULL_REQUEST_LABELS };
export default updatePullRequestLabels;
