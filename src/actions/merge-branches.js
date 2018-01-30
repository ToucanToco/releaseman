import { logInfo, logTaskStart } from '../log';

const MERGE_BRANCHES = 'MERGE_BRANCHES';

const mergeBranches = ({ getters, state }, isSkipped) => {
  logTaskStart('Merge branches');

  if (isSkipped) {
    return undefined;
  }

  logInfo(`Merging \`${state.data.head}\` into \`${state.data.base}\`...`);

  return getters.github.branches.merge({
    base: state.data.base,
    head: state.data.head
  })
    .then(({ url }) => logInfo(url));
};

export { MERGE_BRANCHES };
export default mergeBranches;
