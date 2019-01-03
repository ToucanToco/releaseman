import { logInfo, logTaskStart } from '../log'

const CREATE_RELEASE = 'CREATE_RELEASE'

const createRelease = ({ getters }) => async ({
  branch,
  changelog,
  isPrerelease,
  isSkipped,
  name,
  tag
}) => {
  logTaskStart('Create release')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Creating new ${
    isPrerelease
      ? 'prerelease'
      : 'release'
  }...`)

  const release = await getters.query('releases.create')({
    branch: branch,
    changelog: changelog,
    isPrerelease: isPrerelease,
    name: name,
    tag: tag
  })

  logInfo(release.url)

  return release
}

export { CREATE_RELEASE }
export default createRelease
