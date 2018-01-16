import Config from '../config';
import fs from 'fs';
import isEqual from 'lodash/fp/isEqual';
import { ACTIONS, STATE_FILE_PATH } from '../store';
import { RUN, SAVE_STATE } from '../actions';
import { SET_CONFIG } from '../mutations';

const START = 'START';

const start = ({ commit, dispatch, state }, argv) => {
  try {
    commit(SET_CONFIG, Config(argv));
  } catch (e) {
    return Promise.reject(e);
  }

  if (
    !isEqual(state.config.action)(ACTIONS.CONTINUE) &&
    fs.existsSync(STATE_FILE_PATH)
  ) {
    fs.unlinkSync(STATE_FILE_PATH);
  }

  return dispatch(RUN)
    .catch((e) => (
      dispatch(SAVE_STATE)
        .then(() => Promise.reject(e))
    ));
};

export { START };
export default start;
