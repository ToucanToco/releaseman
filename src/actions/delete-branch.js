import { logInfo, logTaskStart } from '../log';

const DELETE_BRANCH = 'DELETE_BRANCH';

const deleteBranch = ({ getters, state }, isSkipped) => {
  logTaskStart('Delete branch');

  if (isSkipped) {
    return undefined;
  }

  logInfo(`Deleting branch \`${state.data.branch}\`...`);

  return getters.github.branches.delete({ branch: state.data.branch });
};

export { DELETE_BRANCH };
export default deleteBranch;