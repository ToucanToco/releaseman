import filter from 'lodash/fp/filter'
import flow from 'lodash/fp/flow'
import get from 'lodash/fp/get'
import GitHub from '../github'
import isEmpty from 'lodash/fp/isEmpty'
import isUndefined from 'lodash/fp/isUndefined'
import join from 'lodash/fp/join'
import map from 'lodash/fp/map'
import Store from '../store'

const SET_CONFIG = 'SET_CONFIG'

const setConfig = (state, config) => {
  state.config = config
  // Update dependencies
  Store.getters.validateConfig = (...keys) => {
    const error = flow(
      filter((key) => isUndefined(get(key)(config))),
      map((key) => `The <${key}> param is mandatory!`),
      join('\n')
    )(keys)

    if (isEmpty(error)) {
      return undefined
    }

    throw error
  }
  Store.getters.github = GitHub(config)
}

export { SET_CONFIG }
export default setConfig
