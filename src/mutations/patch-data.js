import set from 'lodash/fp/set'

const PATCH_DATA = 'PATCH_DATA'

const patchData = (state) => ({ path, value }) => {
  state.data = set(path)(value)(state.data)
}

export { PATCH_DATA }
export default patchData
