import includes from 'lodash/fp/includes'
import isEqual from 'lodash/fp/isEqual'
import { GET_CHANGELOG, GET_LATEST_RELEASE } from '../actions'
import { logActionEnd, logActionStart } from '../log'

const RUN_CHANGES = 'RUN_CHANGES'

const runChanges = ({ getters, state }) => async () => {
  logActionStart(RUN_CHANGES)

  if (!includes(state.config.position)(['finish', 'start'])) {
    throw 'The `changes` command must be run in start or finish mode!'
  }

  const isFinish = isEqual('finish')(state.config.position)
  const mandatoryConfigParams = [
    'branches.master',
    'categories',
    'labels.release'
  ]

  getters.validateConfig(...(
    isFinish
      ? mandatoryConfigParams
      : ['branches.develop', ...mandatoryConfigParams]
  ))

  let changelogHead = state.config.branches.develop

  if (isFinish) {
    const latestRealease = await getters.runOrSkip(0, 1)(GET_LATEST_RELEASE)({
      isPrerelease: true
    })

    changelogHead = latestRealease.tag
  }

  await getters.runOrSkip(0, 1, 2)(GET_CHANGELOG)({
    base: state.config.branches.master,
    head: changelogHead
  })

  return logActionEnd(RUN_CHANGES)
}

export { RUN_CHANGES }
export default runChanges
