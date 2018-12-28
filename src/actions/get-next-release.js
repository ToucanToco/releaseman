import add from 'lodash/fp/add'
import flow from 'lodash/fp/flow'
import get from 'lodash/fp/get'
import isEqual from 'lodash/fp/isEqual'
import isUndefined from 'lodash/fp/isUndefined'
import toNumber from 'lodash/fp/toNumber'
import { ASSIGN_DATA } from '../mutations'
import { logInfo, logTaskStart } from '../log'

const GET_NEXT_RELEASE = 'GET_NEXT_RELEASE'

const getNextRelease = ({ commit, getters, state }, isSkipped) => {
  logTaskStart('Get next release')

  if (isSkipped) {
    return undefined
  }

  const isLatestPrerelease = isEqual(
    Boolean(state.data.isPrerelease)
  )(
    Boolean(state.data.isFix)
  )

  logInfo(`Retrieving latest ${
    isLatestPrerelease
      ? 'prerelease'
      : 'release'
  }...`)

  return getters.github.releases.getLatest({
    isPrerelease: isLatestPrerelease
  })
    .then(({ name, tag }) => {
      logInfo(`${tag}: ${name}`)
      logInfo(`Parsing ${
        state.data.isFix
          ? 'fixed'
          : 'next'
      } ${
        state.data.isPrerelease
          ? 'prerelease'
          : 'release'
      }...`)

      let nextName = null
      let nextTag = null

      if (state.data.isPrerelease) {
        if (state.data.isFix) {
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
            `^${state.config.tag}(\\d+)\\.(\\d+)\\.\\d+$`
          ).exec(tag)

          const major = (
            state.data.isBreaking
              ? flow(
                get(1),
                toNumber,
                add(1)
              )(tagMatch)
              : get(1)(tagMatch)
          )
          const minor = (
            state.data.isBreaking
              ? 0
              : flow(
                get(2),
                toNumber,
                add(1)
              )(tagMatch)
          )

          nextName = `${state.data.name} beta`
          nextTag = `${state.config.tag}${major}.${minor}.0-beta`
        }
      } else if (state.data.isFix) {
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

      return commit(ASSIGN_DATA, {
        name: nextName,
        tag: nextTag
      })
    })
}

export { GET_NEXT_RELEASE }
export default getNextRelease
