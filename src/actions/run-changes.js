import includes from 'lodash/fp/includes'
import isEqual from 'lodash/fp/isEqual'
import { ASSIGN_DATA, SET_DATA } from '../mutations'
import { GET_CHANGELOG, GET_LATEST_RELEASE } from '../actions'
import { logActionEnd, logActionStart } from '../log'

const RUN_CHANGES = 'RUN_CHANGES'

const runChanges = async ({ commit, getters, state }) => {
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

  if (isFinish) {
    if (getters.matchesTaskIndex(0)) {
      commit(SET_DATA, { isPrerelease: true })
    }

    await getters.runOrSkip(0, 1)(GET_LATEST_RELEASE)

    if (getters.matchesTaskIndex(1)) {
      commit(ASSIGN_DATA, {
        base: state.config.branches.master,
        head: state.data.tag
      })
    }
  } else if (getters.matchesTaskIndex(0)) {
    commit(SET_DATA, {
      base: state.config.branches.master,
      head: state.config.branches.develop
    })
  }

  await getters.runOrSkip(0, 1, 2)(GET_CHANGELOG)

  return logActionEnd(RUN_CHANGES)
}

export { RUN_CHANGES }
export default runChanges
