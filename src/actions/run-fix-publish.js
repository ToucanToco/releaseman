import isEmpty from 'lodash/fp/isEmpty';
import kebabCase from 'lodash/fp/kebabCase';
import { ASSIGN_DATA, SET_DATA } from '../mutations';
import {
  CREATE_PULL_REQUEST,
  GET_RELEASE_BRANCH,
  UPDATE_PULL_REQUEST_LABELS
} from '../actions';
import { logActionEnd, logActionStart } from '../log';

const RUN_FIX_PUBLISH = 'RUN_FIX_PUBLISH';

const runFixPublish = ({ commit, getters, state }) => {
  logActionStart(RUN_FIX_PUBLISH);

  const configError = getters.configError(
    (
      state.config.isDoc
        ? 'branches.doc'
        : 'branches.fix'
    ),
    'branches.release',
    (
      state.config.isDoc
        ? 'labels.doc'
        : 'labels.fix'
    ),
    'labels.wip',
    'name',
    'tag'
  );

  if (!isEmpty(configError)) {
    return Promise.reject(configError);
  }
  if (getters.isCurrentTaskIndex(0)) {
    commit(SET_DATA, {});
  }

  return getters.runOrSkip(0, 1)(GET_RELEASE_BRANCH)
    .then(() => {
      if (getters.isCurrentTaskIndex(1)) {
        return commit(ASSIGN_DATA, {
          base: state.data.branch,
          changelog: {
            labels: [],
            text: undefined
          },
          head: `${
            state.config.isDoc
              ? state.config.branches.doc
              : state.config.branches.fix
          }${kebabCase(state.config.name)}`,
          name: `${
            state.config.isDoc
              ? 'Doc'
              : 'Fix'
          } :: ${state.config.name}`
        });
      }

      return undefined;
    })
    .then(() => getters.runOrSkip(1, 2)(CREATE_PULL_REQUEST))
    .then(() => {
      if (getters.isCurrentTaskIndex(2)) {
        return commit(ASSIGN_DATA, {
          labels: [
            (
              state.config.isDoc
                ? state.config.labels.doc
                : state.config.labels.fix
            ),
            state.config.labels.wip
          ]
        });
      }

      return undefined;
    })
    .then(() => getters.runOrSkip(2, 3)(UPDATE_PULL_REQUEST_LABELS))
    .then(() => logActionEnd(RUN_FIX_PUBLISH));
};

export { RUN_FIX_PUBLISH };
export default runFixPublish;
