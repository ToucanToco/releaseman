import first from 'lodash/fp/first';
import flow from 'lodash/fp/flow';
import initial from 'lodash/fp/initial';
import isEmpty from 'lodash/fp/isEmpty';
import isEqual from 'lodash/fp/isEqual';
import join from 'lodash/fp/join';
import last from 'lodash/fp/last';
import size from 'lodash/fp/size';

const toReadableList = (list) => {
  if (isEmpty(list)) {
    return '';
  }
  if (flow(size, isEqual(1))(list)) {
    return first(list);
  }

  return flow(
    initial,
    join(', '),
    (start) => `${start} and ${last(list)}`
  )(list);
};

export {
  toReadableList
};
