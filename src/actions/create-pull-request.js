import { logInfo, logWarn } from '../log'

const CREATE_PULL_REQUEST = 'CREATE_PULL_REQUEST'

const createPullRequest = ({ getters }) => async ({
  base,
  head,
  message,
  name
}) => {
  logInfo(`Creating pull request for \`${head}\` into \`${base}\`...`)

  const existingPull = await getters.query('pulls.find')({
    base,
    head
  })
  let pull

  if (existingPull === undefined) {
    pull = await getters.query('pulls.create')({
      base,
      head,
      message,
      name
    })
  } else {
    logWarn('This pull request already exists.')

    pull = await getters.query('pulls.update')({
      message,
      name,
      number: existingPull.number
    })
  }

  logInfo(pull.url)

  return pull
}

export { CREATE_PULL_REQUEST }
export default createPullRequest
