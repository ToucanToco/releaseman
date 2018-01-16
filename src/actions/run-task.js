import { logSuccess } from '../log';
import { SET_TASK_INDEX } from '../mutations';

const RUN_TASK = 'RUN_TASK';

const runTask = ({ commit, dispatch }, { index, name }) => {
  commit(SET_TASK_INDEX, index);

  return dispatch(name)
    .then(() => logSuccess('Done.\n'));
};

export { RUN_TASK };
export default runTask;
