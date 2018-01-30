import lt from 'lodash/fp/lt';
import { ASSIGN_DATA } from '../mutations';
import { logInfo, logTaskStart } from '../log';

const GET_RELEASES_EXISTENCE = 'GET_RELEASES_EXISTENCE';

const getReleasesExistence = ({ commit, getters, state }, isSkipped) => {
  logTaskStart('Get releases existence');

  if (isSkipped) {
    return undefined;
  }

  logInfo(`Retrieving ${
    state.data.isPrerelease
      ? 'prereleases'
      : 'releases'
  } existence...`);

  return getters.github.releases.size({
    isPrerelease: state.data.isPrerelease
  })
    .then((size) => {
      const isWithReleases = lt(0)(size);

      logInfo(isWithReleases);

      return commit(ASSIGN_DATA, { isWithReleases: isWithReleases });
    });
};

export { GET_RELEASES_EXISTENCE };
export default getReleasesExistence;
