Man =
  """
  Usage: releaseman <command> [--owner=<owner>] [--repo=<repo>]

  <command> Available commands (default: 'help')
    beta <name>
    fix <pr>
    help
    hotfix <pr>
    info <release>
    release
  <name> The release's name
  <owner> The repository owner (default: 'toucantoco')
  <pr> The Pull Request's number
  <release> On which to get info (default: 'release')
    beta
    release
  <repo> The repository's name (default: 'tucana')

  """

export default Man
