Man =
  """
  Usage: releaseman <command> --repo=<repo> [--owner=<owner>]

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
  <repo> The repository's name

  """

export default Man
