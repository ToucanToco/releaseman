import { COMMANDS } from '../store'
import { log } from '../log'

const GET_HELP = 'GET_HELP'

const _logTrim = (value) => log(`${value.trim()}\n`)

const getHelp = ({ state }) => () => {
  const options = `
Options:

  --branches.alpha <value>    Latest alpha branch
  --branches.beta <value>     Latest beta branch
  --branches.develop <value>  Develop branch
  --branches.feature <value>  Feature branches prefix
  --branches.fix <value>      Fix branches prefix
  --branches.hotfix <value>   Hotfix branches prefix
  --branches.master <value>   Master branch
  --categories <value>        JSON array of labels/titles from which the
                              changelogs are generated
  --defaults <path>           Path to a custom defaults JSON file
  --labels.breaking <value>   Label triggering a breaking change in the version
                              number
  --labels.feature <value>    Label for features pull requests
  --labels.fix <value>        Label for fixes pull requests
  --labels.release <value>    Label for releases pull requestss
  --no-release                Skip tag/release creation (for fixes/hotfixes)
  --owner <value>             Repository owner
  --repo <value>              Repository name
  --tag <value>               Tags prefix
  --token <value>             GitHub access token
  --verbose                   Log requests & full errors
`.trim()

  const helpDefault = `
Usage: releaseman <command> [options]

${options}

Commands:

  - alpha
  - beta
  - compare
  - continue
  - help
  - stable

Run \`releaseman help <command>\` for more information on specific commands.
`.trim()

  if (state.config.command !== COMMANDS.HELP) {
    throw `${helpDefault}\n`
  }

  switch (state.config.helpOn) {
    case COMMANDS.ALPHA:
      return _logTrim(`
Usage: releaseman alpha (auto|fix <number>|release [<name>]) [options]

Description:

  Create a new alpha or fix an existing one.

Command specific options:

  auto                        Run a new fix or release process based on the
                              last commit on the alpha branch (does not merge
                              into the alpha branch)
  fix                         Merge the fix into the alpha branch and backport
                              it
  release                     Create a new alpha release
  <name>                      Release's name
  <number>                    Fix pull request number

${options}
`)
    case COMMANDS.BETA:
      return _logTrim(`
Usage: releaseman beta (auto|fix <number>|release [<name>]) [options]

Description:

  Create a new beta or fix an existing one.

Command specific options:

  auto                        Run a new fix or release process based on the
                              last commit on the beta branch (does not merge
                              into the beta branch)
  fix                         Merge the fix into the beta branch, fix the beta
                              release and backport it
  release                     Create a new beta release
  <name>                      Release's name
  <number>                    Fix pull request number

${options}
`)
    case COMMANDS.COMPARE:
      return _logTrim(`
Usage: releaseman compare <base> <head> [options]

Description:

  Display the changelog for <head> since <base>.

${options}
`)
    case COMMANDS.CONTINUE:
      return _logTrim(`
Usage: releaseman continue

Description:

  Re-run the last command starting where it failed.
`)
    case COMMANDS.HELP:
      return _logTrim(`
Usage: releaseman help [<command>]

Description:

  Display help on \`releaseman\`'s usage.

Command specific option:

  <command>                   Command on which to display help: alpha, beta,
                              compare, continue or stable
`)
    case COMMANDS.STABLE:
      return _logTrim(`
Usage: releaseman stable (auto|[hot]fix <number>|release [<name>]) [options]

Description:

  Create a new release or fix an existing one.

Command specific options:

  auto                        Run a new hotfix or release process based on the
                              last commit on the master branch (does not merge
                              into the master branch)
  fix                         Merge the hotfix into the master branch, fix the
                              stable release and backport it
  hotfix                      Alias for fix
  release                     Create a new stable release
  <name>                      Release's name
  <number>                    Hotfix pull request number

${options}
`)
    case undefined:
      return _logTrim(helpDefault)
    default:
      throw `${helpDefault}\n`
  }
}

export { GET_HELP }
export default getHelp
