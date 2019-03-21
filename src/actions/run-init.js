import flow from 'lodash/fp/flow'
import get from 'lodash/fp/get'
import includes from 'lodash/fp/includes'
import isEmpty from 'lodash/fp/isEmpty'
import last from 'lodash/fp/last'
import map from 'lodash/fp/map'
import reject from 'lodash/fp/reject'
import toPairs from 'lodash/fp/toPairs'
import {
  CREATE_BRANCH,
  CREATE_LABELS,
  CREATE_RELEASE,
  GET_BRANCH_EXISTENCE,
  GET_LABELS,
  GET_LATEST_RELEASE,
  GET_RELEASE_EXISTENCE
} from '../actions'
import { logActionEnd, logActionStart, logWarn } from '../log'

const LABELS_DEFAULT_COLORS = {
  breaking: 'ffc107',
  doc: '607d8b',
  feature: '4caf50',
  fix: 'f44336',
  release: '2196f3',
  wip: '9c27b0'
}
const RUN_INIT = 'RUN_INIT'

const runInit = ({ getters, state }) => async () => {
  logActionStart(RUN_INIT)
  getters.validateConfig(
    'branches.beta',
    'branches.develop',
    'branches.master',
    'labels.breaking',
    'labels.doc',
    'labels.feature',
    'labels.fix',
    'labels.release',
    'labels.wip',
    'tag'
  )

  const isDevelopPresent = await getters.runOrSkip(0)(GET_BRANCH_EXISTENCE)({
    name: state.config.branches.develop
  })

  if (isDevelopPresent) {
    logWarn(`${state.config.branches.develop} already present.\n`)
  } else {
    await getters.runOrSkip(1)(CREATE_BRANCH)({
      base: state.config.branches.master,
      head: state.config.branches.develop
    })
  }

  const isReleasePresent = await getters.runOrSkip(2)(GET_RELEASE_EXISTENCE)({
    isPrerelease: false
  })

  if (isReleasePresent) {
    logWarn('Release already present.\n')
  } else {
    await getters.runOrSkip(3)(CREATE_RELEASE)({
      branch: state.config.branches.master,
      changelog: 'Initial release',
      isPrerelease: false,
      name: 'Initial release',
      tag: `${state.config.tag}0.0.0`
    })
  }

  const isPrereleasePresent = (
    await getters.runOrSkip(4)(GET_RELEASE_EXISTENCE)({
      isPrerelease: true
    })
  )

  if (isPrereleasePresent) {
    logWarn('Prerelease already present.\n')
  } else {
    const latestRelease = await getters.runOrSkip(5)(GET_LATEST_RELEASE)({
      isStable: true
    })

    await getters.runOrSkip(6)(CREATE_RELEASE)({
      branch: state.config.branches.master,
      changelog: `${latestRelease.name} beta`,
      isPrerelease: true,
      name: `${latestRelease.name} beta`,
      tag: `${latestRelease.tag}-beta`
    })
  }

  const isBranchPresent = await getters.runOrSkip(7)(GET_BRANCH_EXISTENCE)({
    name: state.config.branches.beta
  })

  if (isBranchPresent) {
    logWarn(`${state.config.branches.beta} already present.\n`)
  } else {
    await getters.runOrSkip(8)(CREATE_BRANCH)({
      base: state.config.branches.develop,
      head: state.config.branches.beta
    })
  }

  const labelsNames = map('name')(
    await getters.runOrSkip(9)(GET_LABELS)()
  )

  const missingLabels = flow(
    toPairs,
    reject((labelPair) => includes(last(labelPair))(labelsNames)),
    map(([key, name]) => ({
      color: get(key)(LABELS_DEFAULT_COLORS),
      name: name
    }))
  )(state.config.labels)

  if (isEmpty(missingLabels)) {
    logWarn('All mandatory labels already present.\n')
  } else {
    await getters.runOrSkip(10)(CREATE_LABELS)({
      labels: missingLabels
    })
  }

  return logActionEnd(RUN_INIT)
}

export { RUN_INIT }
export default runInit
