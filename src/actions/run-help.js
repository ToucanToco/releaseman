import isEqual from 'lodash/fp/isEqual'
import trim from 'lodash/fp/trim'
import { ACTIONS } from '../store'
import { log } from '../log'

const RUN_HELP = 'RUN_HELP'

const _logTrim = (value) => log(`${trim(value)}\n`)

const runHelp = ({ state }) => () => {
  const options = trim(`
Options:

  --branches.beta <value>     Latest beta branch
  --branches.develop <value>  Develop branch
  --branches.doc <value>      Documentation branches prefix
  --branches.feature <value>  Feature branches prefix
  --branches.fix <value>      Fix branches prefix
  --branches.hotfix <value>   Hotfix branches prefix
  --branches.master <value>   Master branch
  --branches.release <value>  Release branches prefix
  --categories <value>        JSON array of labels/titles from which the
                              changelogs are generated
  --defaults <path>           Path to a custom defaults JSON file
  --doc                       Enable documentation mode
  --labels.breaking <value>   Label triggering a breaking change in the version
                              number
  --labels.doc <value>        Label for documentation pull requests
  --labels.feature <value>    Label for features pull requests
  --labels.fix <value>        Label for fixes pull requests
  --labels.release <value>    Label for releases pull requests
  --labels.wip <value>        Label for unfinished pull requests
  --no-release                Skip tag/release creation (for fixes/hotfixes)
  --owner <value>             Repository owner
  --repo <value>              Repository name
  --tag <value>               Tags prefix
  --token <value>             GitHub access token
  --verbose                   Log requests & full errors
`)

  const helpDefault = trim(`
Usage: releaseman <command> [options]

${options}

Commands:

  - changes
  - continue
  - feature
  - fix
  - help
  - hotfix
  - init
  - release

Run \`releaseman help <command>\` for more information on specific commands.
`)

  if (!isEqual(ACTIONS.HELP)(state.config.action)) {
    throw `${helpDefault}\n`
  }

  switch (state.config.helpOn) {
    case ACTIONS.CHANGES:
      return _logTrim(`
Usage: releaseman changes start|finish [options]

Description:

  Display the changelog for the next beta or stable release.

Command specific options:

  finish                      Use latest beta and master
  start                       Use develop and master

${options}
`)
    case ACTIONS.CONTINUE:
      return _logTrim(`
Usage: releaseman continue

Description:

  Re-run the last command starting where it failed.
`)
    case ACTIONS.FEATURE:
      return _logTrim(`
Usage: releaseman feature ((start|publish) <name>)|(finish <number>) [options]

Description:

  Start, publish or finish a feature.

Command specific options:

  finish                      Merge the feature into develop
  publish                     Create the pull request
  start                       Create a new branch from develop
  <name>                      Feature name
  <number>                    Feature pull request number

${options}
`)
    case ACTIONS.FIX:
      return _logTrim(`
Usage: releaseman fix ((start|publish) <name>)|(finish <number>) [options]

Description:

  Start, publish or finish a fix.

Command specific options:

  finish                      Merge the fix into the release branch and
                              backport it
  publish                     Create the pull request
  start                       Create a new branch from the release branch
  <name>                      Fix name
  <number>                    Fix pull request number

${options}
`)
    case ACTIONS.HELP:
      return _logTrim(`
Usage: releaseman help [<command>]

Description:

  Display help on \`releaseman\`'s usage.

Command specific option:

  <command>                   Command on which to display help: changes,
                              continue, feature, fix, help, hotfix, init or
                              release
`)
    case ACTIONS.HOTFIX:
      return _logTrim(`
Usage: releaseman hotfix ((start|publish) <name>)|(finish <number>) [options]

Description:

  Start, publish or finish a hotfix.

Command specific options:

  finish                      Merge the hotfix into master and backport it
  publish                     Create the pull request
  start                       Create a new branch from master
  <name>                      Hotfix name
  <number>                    Hotfix pull request number

${options}
`)
    case ACTIONS.INIT:
      return _logTrim(`
Usage: releaseman init

Description:

  Make your repository ready for \`releaseman\` by creating develop and
  latest-beta branches, an initial release and labels.

${options}
`)
    case ACTIONS.RELEASE:
      return _logTrim(`
Usage: releaseman release (start <name>)|finish [options]

Description:

  Create a new beta or stable release. The <name> param is used as the new
  release's name. It is used only when creating a new beta since the stable
  release will reuse it's beta name.

Command specific options:

  finish                      Create a new stable release
  start                       Create a new beta release
  <name>                      Release name

${options}
`)
    case undefined:
      return _logTrim(helpDefault)
    default:
      throw `${helpDefault}\n`
  }
}

export { RUN_HELP }
export default runHelp
