import isEmpty from 'lodash/fp/isEmpty';
import map from 'lodash/fp/map';
import { ASSIGN_DATA } from '../mutations';
import { logInfo, logTaskStart } from '../log';
import { toReadableList } from '../helpers';

const GET_LABELS = 'GET_LABELS';

const getLabels = ({ commit, getters }, isSkipped) => {
  logTaskStart('Get labels');

  if (isSkipped) {
    return undefined;
  }

  logInfo('Retrieving labels...');

  return getters.github.labels.index()
    .then((labels) => {
      if (isEmpty(labels)) {
        logInfo('No labels');
      } else {
        logInfo(toReadableList(map('name')(labels)));
      }

      return commit(ASSIGN_DATA, { labels: labels });
    });
};

export { GET_LABELS };
export default getLabels;
