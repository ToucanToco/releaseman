import { logInfo, logTaskStart } from '../log'

const CREATE_PULL_REQUEST = 'CREATE_PULL_REQUEST'

const createPullRequest = ({ getters }) => async ({
  base,
  changelog,
  head,
  isSkipped,
  name
}) => {
  logTaskStart('Create pull request')

  if (isSkipped) {
    return undefined
  }

  logInfo(`Creating pull request for \`${head}\` into \`${base}\`...`)

  const pullRequest = await getters.query('pullRequests.create')({
    base: base,
    changelog: changelog,
    head: head,
    name: name
  })

  logInfo(pullRequest.url)

  return pullRequest
}

export { CREATE_PULL_REQUEST }
export default createPullRequest
