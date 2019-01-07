import fs from 'fs'
import { STATE_FILE_PATH } from '../store'

const SAVE_STATE = 'SAVE_STATE'

const saveState = ({ state }) => () => (
  fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2), 'utf8')
)

export { SAVE_STATE }
export default saveState
