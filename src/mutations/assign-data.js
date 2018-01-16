import assign from 'lodash/fp/assign';

const ASSIGN_DATA = 'ASSIGN_DATA';

const assignData = (state, data) => {
  state.data = assign(state.data)(data);
};

export { ASSIGN_DATA };
export default assignData;
