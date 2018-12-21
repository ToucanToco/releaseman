import lt from 'lodash/fp/lt';
import { ASSIGN_DATA } from '../mutations';
import { logInfo, logTaskStart } from '../log';

const GET_BRANCH_EXISTENCE = 'GET_BRANCH_EXISTENCE';

const getBranchExistence = ({ commit, getters, state }, isSkipped) => {
  logTaskStart('Get branch existence');

  if (isSkipped) {
    return undefined;
  }

  logInfo(`Retrieving ${state.data.branch} existence...`);

  return getters.github.branches.getExistence({
    name: state.data.branch
  })
    .then((isBranchPresent) => {
      logInfo(isBranchPresent);

      return commit(ASSIGN_DATA, { isBranchPresent: isBranchPresent });
    });
};

export { GET_BRANCH_EXISTENCE };
export default getBranchExistence;
