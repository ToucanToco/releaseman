import { logWarn } from '../log';

const SKIP_TASK = 'SKIP_TASK';

const skipTask = ({ dispatch }, { name }) => {
  dispatch(name, true)
    .then(() => logWarn('Skipped.\n'));
};

export { SKIP_TASK };
export default skipTask;
