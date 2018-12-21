import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import includes from 'lodash/fp/includes';
import isEmpty from 'lodash/fp/isEmpty';
import last from 'lodash/fp/last';
import map from 'lodash/fp/map';
import reject from 'lodash/fp/reject';
import toPairs from 'lodash/fp/toPairs';
import { ASSIGN_DATA, SET_DATA } from '../mutations';
import {
  CREATE_BRANCH,
  CREATE_LABELS,
  CREATE_RELEASE,
  GET_BRANCH_EXISTENCE,
  GET_LABELS,
  GET_LATEST_RELEASE,
  GET_RELEASES_EXISTENCE
} from '../actions';
import { logActionEnd, logActionStart, logWarn } from '../log';

const LABELS_DEFAULT_COLORS = {
  breaking: 'ffc107',
  doc: '607d8b',
  feature: '4caf50',
  fix: 'f44336',
  release: '2196f3',
  wip: '9c27b0'
};
const RUN_INIT = 'RUN_INIT';

const runInit = ({ commit, getters, state }) => {
  logActionStart(RUN_INIT);

  const configError = getters.configError(
    'branches.develop',
    'branches.master',
    'labels.breaking',
    'labels.doc',
    'labels.feature',
    'labels.fix',
    'labels.release',
    'labels.wip',
    'tag'
  );

  if (!isEmpty(configError)) {
    return Promise.reject(configError);
  }
  if (getters.isCurrentTaskIndex(0)) {
    commit(SET_DATA, { branch: state.config.branches.develop });
  }

  return getters.runOrSkip(0, 1)(GET_BRANCH_EXISTENCE)
    .then(() => {
      if (getters.isCurrentTaskIndex(1)) {
        if (state.data.isBranchPresent) {
          return logWarn(`${state.config.branches.develop} already present.\n`);
        }

        commit(ASSIGN_DATA, {
          base: state.config.branches.master,
          head: state.config.branches.develop
        });
      }

      return getters.runOrSkip(1, 2)(CREATE_BRANCH);
    })
    .then(() => {
      if (getters.isCurrentTaskIndex(1) || getters.isCurrentTaskIndex(2)) {
        return commit(ASSIGN_DATA, { isPrerelease: false });
      }

      return undefined;
    })
    .then(() => getters.runOrSkip(1, 2, 3)(GET_RELEASES_EXISTENCE))
    .then(() => {
      if (getters.isCurrentTaskIndex(3)) {
        if (state.data.isWithReleases) {
          return logWarn('Release already present.\n');
        }

        commit(ASSIGN_DATA, {
          branch: state.config.branches.master,
          changelog: {
            labels: [],
            text: 'Initial release'
          },
          name: 'Initial release',
          tag: `${state.config.tag}0.0.0`
        });
      }

      return getters.runOrSkip(3, 4)(CREATE_RELEASE);
    })
    .then(() => {
      if (getters.isCurrentTaskIndex(3) || getters.isCurrentTaskIndex(4)) {
        return commit(ASSIGN_DATA, { isPrerelease: true });
      }

      return undefined;
    })
    .then(() => getters.runOrSkip(3, 4, 5)(GET_RELEASES_EXISTENCE))
    .then(() => {
      if (getters.isCurrentTaskIndex(5)) {
        if (state.data.isWithReleases) {
          return logWarn('Prerelease already present.\n');
        }

        commit(ASSIGN_DATA, { isPrerelease: false })
      }

      return getters.runOrSkip(5, 6)(GET_LATEST_RELEASE)
        .then(() => {
          if (getters.isCurrentTaskIndex(6)) {
            return commit(ASSIGN_DATA, {
              branch: state.config.branches.master,
              changelog: {
                labels: [],
                text: `${state.data.name} beta`
              },
              isPrerelease: true,
              name: `${state.data.name} beta`,
              tag: `${state.data.tag}-beta`
            });
          }

          return undefined
        })
        .then(() => getters.runOrSkip(6, 7)(CREATE_RELEASE));
    })
    .then(() => getters.runOrSkip(5, 7, 8)(GET_LABELS))
    .then(() => {
      if (getters.isCurrentTaskIndex(8)) {
        const labelsNames = map('name')(state.data.labels);

        const missingLabels = flow(
          toPairs,
          reject((labelPair) => includes(last(labelPair))(labelsNames)),
          map(([key, name]) => ({
            color: get(key)(LABELS_DEFAULT_COLORS),
            name: name
          }))
        )(state.config.labels);

        if (isEmpty(missingLabels)) {
          return logWarn('All mandatory labels already present.\n');
        }

        commit(ASSIGN_DATA, { labels: missingLabels });
      }

      return getters.runOrSkip(8, 9)(CREATE_LABELS);
    })
    .then(() => logActionEnd(RUN_INIT));
};

export { RUN_INIT };
export default runInit;
