import add from 'lodash/fp/add'
import flow from 'lodash/fp/flow'
import get from 'lodash/fp/get'
import isEqual from 'lodash/fp/isEqual'
import isUndefined from 'lodash/fp/isUndefined'
import toNumber from 'lodash/fp/toNumber'
import { logInfo, logTaskStart } from '../log'

const GET_NEXT_RELEASE = 'GET_NEXT_RELEASE'

const getNextRelease = ({ getters, state }) => async ({
  isBreaking,
  isFix,
  isPrerelease,
  isSkipped
}) => {
  logTaskStart('Get next release')

  if (isSkipped) {
    return undefined
  }

  const isLatestPrerelease = isEqual(isPrerelease)(isFix)
  const isLatestStable = !isPrerelease && isFix

  logInfo(`Retrieving latest ${
    isLatestPrerelease
      ? 'prerelease'
      : (
        isLatestStable
          ? 'stable release'
          : 'release'
      )
  }...`)

  const { name, tag } = await getters.query('releases.getLatest')({
    isPrerelease: isLatestPrerelease,
    isStable: isLatestStable
  })

  logInfo(`${tag}: ${name}`)
  logInfo(`Parsing ${
    isFix
      ? 'fixed'
      : 'next'
  } ${
    isPrerelease
      ? 'prerelease'
      : 'release'
  }...`)

  let nextName = null
  let nextTag = null

  if (isPrerelease) {
    if (isFix) {
      const nameMatch = new RegExp('^(.*?\\sbeta)\\s?\\d*$').exec(name)
      const tagMatch = new RegExp(
        `^(${state.config.tag}\\d+\\.\\d+\\.\\d+-beta)\\.?(\\d*)$`
      ).exec(tag)

      const latestBetaNumber = get(2)(tagMatch)

      const nextBetaNumber = add(1)(
        isUndefined(latestBetaNumber)
          ? 0
          : toNumber(latestBetaNumber)
      )

      nextName = `${get(1)(nameMatch)} ${nextBetaNumber}`
      nextTag = `${get(1)(tagMatch)}.${nextBetaNumber}`
    } else {
      const tagMatch = new RegExp(
        `^${state.config.tag}(\\d+)\\.(\\d+)\\.\\d+(-beta)?$`
      ).exec(tag)

      const major = (
        isBreaking
          ? flow(
            get(1),
            toNumber,
            add(1)
          )(tagMatch)
          : get(1)(tagMatch)
      )
      const minor = (
        isBreaking
          ? 0
          : flow(
            get(2),
            toNumber,
            add(1)
          )(tagMatch)
      )

      nextName = `${state.config.name} beta`
      nextTag = `${state.config.tag}${major}.${minor}.0-beta`
    }
  } else if (isFix) {
    const nameMatch = new RegExp('^(.*?)\\s?\\d*$').exec(name)
    const tagMatch = new RegExp(
      `^(${state.config.tag}\\d+\\.\\d+)\\.(\\d+)$`
    ).exec(tag)

    const nextFixNumber = flow(
      get(2),
      toNumber,
      add(1)
    )(tagMatch)

    nextName = `${get(1)(nameMatch)} ${nextFixNumber}`
    nextTag = `${get(1)(tagMatch)}.${nextFixNumber}`
  } else {
    const nameMatch = new RegExp('^(.*?)\\sbeta\\s?\\d*$').exec(name)
    const tagMatch = new RegExp(
      `^(${state.config.tag}\\d+\\.\\d+\\.\\d+)-beta\\.?\\d*$`
    ).exec(tag)

    nextName = get(1)(nameMatch)
    nextTag = get(1)(tagMatch)
  }

  logInfo(`${nextTag}: ${nextName}`)

  return {
    name: nextName,
    tag: nextTag
  }
}

export { GET_NEXT_RELEASE }
export default getNextRelease
