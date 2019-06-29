import { logInfo, logWarn } from '../log'

const CREATE_RELEASE = 'CREATE_RELEASE'

const createRelease = ({ getters }) => async ({
  branch,
  isPrerelease = false,
  message,
  name,
  tag
}) => {
  logInfo(`Creating new ${
    isPrerelease
      ? 'prerelease'
      : 'release'
  }...`)

  if (message === 'No new PR') {
    return logWarn('Release already present.')
  }

  const release = await getters.query('releases.create')({
    branch,
    isPrerelease,
    message,
    name,
    tag
  })

  return logInfo(release.url)
}

export { CREATE_RELEASE }
export default createRelease
