import { logInfo } from '../log'

const UPDATE_PULL_REQUEST = 'UPDATE_PULL_REQUEST'

const updatePullRequest = ({ getters }) => async ({
  message,
  name,
  number
}) => {
  logInfo(`Updating pull request #${number}...`)

  const { url } = await getters.query('pulls.update')({
    message,
    name,
    number
  })

  return logInfo(url)
}

export { UPDATE_PULL_REQUEST }
export default updatePullRequest
