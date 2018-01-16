import includes from 'lodash/fp/includes';
import isEqual from 'lodash/fp/isEqual';
import last from 'lodash/fp/last';
import Store from '../store';
import { RUN_TASK, SKIP_TASK } from '../actions';

const SET_TASK_INDEX = 'SET_TASK_INDEX';

const setTaskIndex = (state, taskIndex) => {
  state.taskIndex = taskIndex;
  // Update dependencies
  Store.getters.isCurrentTaskIndex = isEqual(taskIndex);
  Store.getters.runOrSkip = (...indexes) => (name) => Store.dispatch((
    includes(taskIndex)(indexes)
      ? RUN_TASK
      : SKIP_TASK
  ), {
    index: last(indexes),
    name: name
  });
};

export { SET_TASK_INDEX };
export default setTaskIndex;
