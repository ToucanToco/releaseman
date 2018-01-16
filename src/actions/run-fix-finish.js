import concat from 'lodash/fp/concat';
import flow from 'lodash/fp/flow';
import includes from 'lodash/fp/includes';
import isEmpty from 'lodash/fp/isEmpty';
import isEqual from 'lodash/fp/isEqual';
import map from 'lodash/fp/map';
import startsWith from 'lodash/fp/startsWith';
import { SET_DATA, ASSIGN_DATA } from '../mutations';
import {
  CREATE_RELEASE,
  DELETE_BRANCH,
  FIND_RELEASE_PULL_REQUEST,
  GET_CHANGELOG,
  GET_LATEST_RELEASE_TAG,
  GET_NEXT_RELEASE,
  GET_PULL_REQUEST,
  GET_PULL_REQUEST_LABELS,
  GET_RELEASE_BRANCH,
  MERGE_BRANCHES,
  MERGE_PULL_REQUEST,
  UPDATE_PULL_REQUEST,
  UPDATE_PULL_REQUEST_LABELS
} from '../actions';
import { logActionEnd, logActionStart, logWarn } from '../log';

const RUN_FIX_FINISH = 'RUN_FIX_FINISH';

const runFixFinish = ({ commit, getters, state }) => {
  logActionStart(RUN_FIX_FINISH);

  const configError = getters.configError(
    'branches.develop',
    (
      state.config.isDoc
        ? 'branches.doc'
        : 'branches.fix'
    ),
    'branches.release',
    'categories',
    (
      state.config.isDoc
        ? 'labels.doc'
        : 'labels.fix'
    ),
    'number',
    'tag'
  );
  const fixBranchesPrefix = (
    state.config.isDoc
      ? state.config.branches.doc
      : state.config.branches.fix
  );
  const fixLabel = (
    state.config.isDoc
      ? state.config.labels.doc
      : state.config.labels.feature
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
        commit(ASSIGN_DATA, {
          number: state.config.number
        });
      }

      return undefined;
    })
    .then(() => getters.runOrSkip(1, 2)(GET_PULL_REQUEST))
    .then(() => {
      if (getters.isCurrentTaskIndex(2)) {
        if (!isEqual(state.data.branch)(state.data.base)) {
          return Promise.reject(
            `A fix cannot be merged into \`${state.data.base}\`!`
          );
        }
        if (!startsWith(fixBranchesPrefix)(state.data.head)) {
          return Promise.reject(`A fix branch name must start with \`${
            fixBranchesPrefix
          }\`, your branch name is \`${state.data.head}\`!`);
        }
      }

      return undefined;
    })
    .then(() => getters.runOrSkip(2, 3)(GET_PULL_REQUEST_LABELS))
    .then(() => {
      if (getters.isCurrentTaskIndex(3)) {
        if (flow(
          map('name'),
          includes(fixLabel)
        )(state.data.labels)) {
          return undefined;
        }

        logWarn(`Missing ${fixLabel} label.\n`);

        commit(ASSIGN_DATA, {
          labels: flow(
            map('name'),
            concat(fixLabel)
          )(state.data.labels)
        });
      }

      return getters.runOrSkip(3, 4)(UPDATE_PULL_REQUEST_LABELS);
    })
    .then(() => {
      if (getters.isCurrentTaskIndex(3) || getters.isCurrentTaskIndex(4)) {
        return commit(ASSIGN_DATA, {
          message: `${state.data.name} (#${state.data.number})`,
          method: 'squash'
        });
      }

      return undefined;
    })
    .then(() => getters.runOrSkip(3, 4, 5)(MERGE_PULL_REQUEST))
    .then(() => {
      if (getters.isCurrentTaskIndex(5)) {
        return commit(ASSIGN_DATA, {
          branch: state.data.head
        });
      }

      return undefined;
    })
    .then(() => getters.runOrSkip(5, 6)(DELETE_BRANCH))
    .then(() => {
      if (getters.isCurrentTaskIndex(6)) {
        return commit(ASSIGN_DATA, { isPrerelease: true });
      }

      return undefined;
    })
    .then(() => getters.runOrSkip(6, 7)(GET_LATEST_RELEASE_TAG))
    .then(() => {
      if (getters.isCurrentTaskIndex(7)) {
        return commit(ASSIGN_DATA, {
          base: state.data.tag,
          head: state.data.base
        });
      }

      return undefined;
    })
    .then(() => getters.runOrSkip(7, 8)(GET_CHANGELOG))
    .then(() => {
      if (getters.isCurrentTaskIndex(8)) {
        return commit(ASSIGN_DATA, { isFix: true });
      }

      return undefined;
    })
    .then(() => getters.runOrSkip(8, 9)(GET_NEXT_RELEASE))
    .then(() => {
      if (getters.isCurrentTaskIndex(9)) {
        return commit(ASSIGN_DATA, { branch: state.data.head });
      }

      return undefined;
    })
    .then(() => getters.runOrSkip(9, 10)(CREATE_RELEASE))
    .then(() => {
      if (getters.isCurrentTaskIndex(10)) {
        return commit(ASSIGN_DATA, { base: state.config.branches.master });
      }

      return undefined;
    })
    .then(() => getters.runOrSkip(10, 11)(GET_CHANGELOG))
    .then(() => getters.runOrSkip(11, 12)(FIND_RELEASE_PULL_REQUEST))
    .then(() => {
      if (getters.isCurrentTaskIndex(12)) {
        return commit(ASSIGN_DATA, { name: undefined });
      }

      return undefined;
    })
    .then(() => getters.runOrSkip(12, 13)(UPDATE_PULL_REQUEST))
    .then(() => {
      if (getters.isCurrentTaskIndex(13)) {
        return commit(ASSIGN_DATA, {
          base: state.config.branches.develop
        });
      }

      return undefined;
    })
    .then(() => getters.runOrSkip(13, 14)(MERGE_BRANCHES))
    .then(() => logActionEnd(RUN_FIX_FINISH));
};

export { RUN_FIX_FINISH };
export default runFixFinish;
