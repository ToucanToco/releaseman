import includes from 'lodash/fp/includes';
import isEmpty from 'lodash/fp/isEmpty';
import isEqual from 'lodash/fp/isEqual';
import { ASSIGN_DATA, SET_DATA } from '../mutations';
import { GET_CHANGELOG, GET_LATEST_RELEASE } from '../actions';
import { logActionEnd, logActionStart } from '../log';

const RUN_CHANGES = 'RUN_CHANGES';

const runChanges = ({ commit, getters, state }) => {
  logActionStart(RUN_CHANGES);

  if (!includes(state.config.position)(['finish', 'start'])) {
    return Promise.reject(
      'The `changes` command must be run in start or finish mode!'
    );
  }

  const isFinish = isEqual('finish')(state.config.position);
  const mandatoryConfigParams = [
    'branches.master',
    'categories',
    'labels.release'
  ];

  const configError = getters.configError(...(
    isFinish
      ? mandatoryConfigParams
      : ['branches.develop', ...mandatoryConfigParams]
  ));

  if (!isEmpty(configError)) {
    return Promise.reject(configError);
  }

  return Promise.resolve()
    .then(() => {
      if (isFinish) {
        if (getters.isCurrentTaskIndex(0)) {
          commit(SET_DATA, { isPrerelease: true });
        }

        return getters.runOrSkip(0, 1)(GET_LATEST_RELEASE)
          .then(() => {
            if (getters.isCurrentTaskIndex(1)) {
              return commit(ASSIGN_DATA, {
                base: state.config.branches.master,
                head: state.data.tag
              });
            }

            return undefined;
          });
      }
      if (getters.isCurrentTaskIndex(0)) {
        return commit(SET_DATA, {
          base: state.config.branches.master,
          head: state.config.branches.develop
        });
      }

      return undefined;
    })
    .then(() => getters.runOrSkip(0, 1, 2)(GET_CHANGELOG))
    .then(() => logActionEnd(RUN_CHANGES));
};

export { RUN_CHANGES };
export default runChanges;
