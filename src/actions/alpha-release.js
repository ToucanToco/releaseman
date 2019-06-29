import {
  ALPHA_AUTO_RELEASE,
  CREATE_PULL_REQUEST,
  FIND_PULL_REQUEST,
  GET_CHANGELOG,
  MERGE_PULL_REQUEST,
  UPDATE_PULL_REQUEST,
  UPDATE_PULL_REQUEST_LABELS
} from '../actions'
import { logCommandEnd, logCommandStart } from '../log'

const ALPHA_RELEASE = 'ALPHA_RELEASE'

const alphaRelease = ({ dispatch, getters, state }) => async () => {
  logCommandStart(ALPHA_RELEASE)
  getters.validateConfig(
    'branches.alpha',
    'branches.develop',
    'categories',
    'labels.breaking',
    'labels.release'
  )

  const changelog = await getters.runOrSkip(0)(GET_CHANGELOG)({
    base: state.config.branches.alpha,
    head: state.config.branches.develop
  })
  let pull = await getters.runOrSkip(1)(FIND_PULL_REQUEST)({
    base: state.config.branches.alpha,
    head: state.config.branches.develop
  })

  if (pull === undefined) {
    if (state.config.name === undefined) {
      throw (
        'The <name> param is mandatory when there is no pull request to ' +
        'infer the release name!'
      )
    }

    pull = await getters.runOrSkip(2)(CREATE_PULL_REQUEST)({
      base: state.config.branches.alpha,
      head: state.config.branches.develop,
      message: changelog.message,
      name: `Release :: ${state.config.name} alpha`
    })
  } else {
    let releaseName = state.config.name

    if (releaseName === undefined) {
      const releaseNameMatch = new RegExp('^Release :: (.*?) alpha$')
        .exec(pull.name)

      if (releaseNameMatch === null) {
        throw (
          'Could not infer the release name from pull request ' +
          `#${pull.number}! Please specify the <name> param or format the ` +
          'pull request\'s name to `Release :: <Release name> alpha`'
        )
      }

      releaseName = releaseNameMatch[1]
    }

    pull = await getters.runOrSkip(2)(UPDATE_PULL_REQUEST)({
      message: changelog.message,
      name: `Release :: ${releaseName} alpha`,
      number: pull.number
    })
  }

  await getters.runOrSkip(3)(UPDATE_PULL_REQUEST_LABELS)({
    labels: changelog.labels.includes(state.config.labels.breaking)
      ? [state.config.labels.breaking, state.config.labels.release]
      : [state.config.labels.release],
    number: pull.number
  })
  await getters.runOrSkip(4)(MERGE_PULL_REQUEST)({
    isMergeable: pull.isMergeable,
    isMerged: pull.isMerged,
    message: `${pull.name} (#${pull.number})`,
    number: pull.number
  })
  await dispatch(ALPHA_AUTO_RELEASE)({
    index: 4,
    name: state.config.name
  })

  return logCommandEnd(ALPHA_RELEASE)
}

export { ALPHA_RELEASE }
export default alphaRelease
