import isEmpty from 'lodash/fp/isEmpty';
import kebabCase from 'lodash/fp/kebabCase';
import { ASSIGN_DATA, SET_DATA } from '../mutations';
import { CREATE_PULL_REQUEST, UPDATE_PULL_REQUEST_LABELS } from '../actions';
import { logActionEnd, logActionStart } from '../log';

const RUN_FEATURE_PUBLISH = 'RUN_FEATURE_PUBLISH';

const runFeaturePublish = ({ commit, getters, state }) => {
  logActionStart(RUN_FEATURE_PUBLISH);

  const configError = getters.configError(
    'branches.develop',
    ...(
      state.config.isDoc
        ? ['branches.doc', 'labels.doc']
        : ['branches.feature', 'labels.feature']
    ),
    'labels.wip',
    'name'
  );

  if (!isEmpty(configError)) {
    return Promise.reject(configError);
  }
  if (getters.isCurrentTaskIndex(0)) {
    commit(SET_DATA, {
      base: state.config.branches.develop,
      changelog: {
        labels: [],
        text: undefined
      },
      head: `${
        state.config.isDoc
          ? state.config.branches.doc
          : state.config.branches.feature
      }${kebabCase(state.config.name)}`,
      name: `${
        state.config.isDoc
          ? 'Doc'
          : 'Feature'
      } :: ${state.config.name}`
    });
  }

  return getters.runOrSkip(0, 1)(CREATE_PULL_REQUEST)
    .then(() => {
      if (getters.isCurrentTaskIndex(1)) {
        return commit(ASSIGN_DATA, {
          labels: [
            (
              state.config.isDoc
                ? state.config.labels.doc
                : state.config.labels.feature
            ),
            state.config.labels.wip
          ]
        });
      }

      return undefined;
    })
    .then(() => getters.runOrSkip(1, 2)(UPDATE_PULL_REQUEST_LABELS))
    .then(() => logActionEnd(RUN_FEATURE_PUBLISH));
};

export { RUN_FEATURE_PUBLISH };
export default runFeaturePublish;
