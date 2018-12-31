import GitHub from '../github'
import Store from '../store'

const SET_CONFIG = 'SET_CONFIG'

const setConfig = (state, config) => {
  state.config = config
  // Update dependency
  Store.getters.github = GitHub(config)
}

export { SET_CONFIG }
export default setConfig
