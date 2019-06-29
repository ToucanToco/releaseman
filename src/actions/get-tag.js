import { logInfo } from '../log'

const GET_TAG = 'GET_TAG'

const getTag = ({ getters, state }) => async ({
  isBeta = false,
  isBreaking = false,
  isFix = false
}) => {
  logInfo(`Retrieving tag for new ${
    isBeta
      ? 'beta'
      : 'release'
  }...`)

  const isPrerelease = isBeta === isFix
  const isStable = !isBeta && isFix

  let latestRelease = await getters.query('releases.getLatest')({
    isPrerelease,
    isStable
  })

  if (latestRelease === undefined) {
    latestRelease = {
      isPrerelease,
      tag: `${state.config.tag}0.0.0${
        isPrerelease
          ? '-beta'
          : ''
      }`
    }
  }

  const tagMatch = new RegExp(
    latestRelease.isPrerelease
      ? `^${state.config.tag}(\\d+)\\.(\\d+)\\.(\\d+)-beta(?:\\.(\\d+))?$`
      : `^${state.config.tag}(\\d+)\\.(\\d+)\\.(\\d+)$`
  )
    .exec(latestRelease.tag)

  if (tagMatch === null) {
    throw `The last release tag : \`${
      latestRelease.tag
    }\` is misnamed. It should have the format \`${
      state.config.tag
    }X.Y.${
      latestRelease.isPrerelease
        ? '0-beta.Z'
        : 'Z'
    }\`.`
  }

  const majorVersion = Number(tagMatch[1])
  const minorVersion = Number(tagMatch[2])
  const fixVersion = Number(tagMatch[3])
  const betaVersion = (
    tagMatch[4] === undefined
      ? 0
      : Number(tagMatch[4])
  )
  let tag

  if (isBeta) {
    if (isFix) {
      tag = `${state.config.tag}${majorVersion}.${minorVersion}.0-beta.${
        betaVersion + 1
      }`
    } else {
      tag = `${state.config.tag}${
        isBreaking
          ? majorVersion + 1
          : majorVersion
      }.${
        isBreaking
          ? 0
          : minorVersion + 1
      }.0-beta`
    }
  } else if (isFix) {
    tag = `${state.config.tag}${majorVersion}.${minorVersion}.${fixVersion + 1}`
  } else {
    tag = `${state.config.tag}${majorVersion}.${minorVersion}.0`
  }

  logInfo(tag)

  return tag
}

export { GET_TAG }
export default getTag
