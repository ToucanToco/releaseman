import get from 'lodash/fp/get'
import includes from 'lodash/fp/includes'
import {
  CREATE_BRANCH,
  CREATE_PULL_REQUEST,
  CREATE_RELEASE,
  GET_CHANGELOG,
  GET_NEXT_RELEASE,
  UPDATE_BRANCH,
  UPDATE_PULL_REQUEST_LABELS
} from '../actions'
import { logActionEnd, logActionStart } from '../log'

const RUN_RELEASE_START = 'RUN_RELEASE_START'

const runReleaseStart = ({ getters, state }) => async () => {
  logActionStart(RUN_RELEASE_START)
  getters.validateConfig(
    'branches.beta',
    'branches.develop',
    'branches.master',
    'branches.release',
    'categories',
    'labels.breaking',
    'labels.release',
    'name',
    'tag'
  )

  if (/\sbeta$/i.test(state.config.name)) {
    throw 'The <name> param must be the final release name (no beta)!'
  }

  const changelog = await getters.runOrSkip(0, 1)(GET_CHANGELOG)({
    base: state.config.branches.master,
    head: state.config.branches.develop
  })
  const nextPrerelease = await getters.runOrSkip(1, 2)(GET_NEXT_RELEASE)({
    isBreaking: includes(state.config.labels.breaking)(
      changelog.labels
    ),
    isFix: false,
    isPrerelease: true
  })

  const version = get(1)(
    new RegExp(`^${state.config.tag}(\\d+\\.\\d+\\.\\d+)-beta$`)
      .exec(nextPrerelease.tag)
  )

  const branch = `${state.config.branches.release}${version}`

  await getters.runOrSkip(2, 3)(CREATE_BRANCH)({
    base: state.config.branches.develop,
    head: branch
  })
  await getters.runOrSkip(3, 4)(CREATE_RELEASE)({
    branch: branch,
    changelog: changelog.text,
    isPrerelease: true,
    name: nextPrerelease.name,
    tag: nextPrerelease.tag
  })
  const pullRequest = await getters.runOrSkip(4, 5)(CREATE_PULL_REQUEST)({
    base: state.config.branches.master,
    changelog: changelog.text,
    head: branch,
    name: `Release :: ${get(1)(
      new RegExp('^(.*?) beta$').exec(nextPrerelease.name)
    )}`
  })
  await getters.runOrSkip(5, 6)(UPDATE_PULL_REQUEST_LABELS)({
    labels: [state.config.labels.release],
    number: pullRequest.number
  })
  await getters.runOrSkip(6, 7)(UPDATE_BRANCH)({
    base: state.config.branches.beta,
    head: branch
  })

  return logActionEnd(RUN_RELEASE_START)
}

export { RUN_RELEASE_START }
export default runReleaseStart
