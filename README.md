# Releaseman
Git flow + GitHub PRs = <3

## Installation
- Copy `src/defaults.json.dist` as `src/defaults.json`
- Complete the new file with your defaults (See [options](#options))
- Run `yarn`
- You now have an executable file at `./bin/releaseman`

> :warning: Each time `defaults.json` is modified or `releaseman` updated, you need to run `yarn` again to update the binary

## Usage
`releaseman <command> [options]`

### Options
| CLI                          | Description                                                         |
| ---------------------------- | ------------------------------------------------------------------- |
| `--branches.beta <value>`    | Latest beta branch                                                  |
| `--branches.develop <value>` | Develop branch                                                      |
| `--branches.doc <value>`     | Documentation branches prefix                                       |
| `--branches.feature <value>` | Feature branches prefix                                             |
| `--branches.fix <value>`     | Fix branches prefix                                                 |
| `--branches.hotfix <value>`  | Hotfix branches prefix                                              |
| `--branches.master <value>`  | Master branch                                                       |
| `--branches.release <value>` | Release branches prefix                                             |
| `--categories <value>`       | JSON array of labels/titles from which the changelogs are generated |
| `--defaults <path>`          | Path to a custom defaults JSON file                                 |
| `--doc`                      | Enable documentation mode                                           |
| `--labels.breaking <value>`  | Label triggering a breaking change in the version number            |
| `--labels.doc <value>`       | Label for documentation pull requests                               |
| `--labels.feature <value>`   | Label for features pull requests                                    |
| `--labels.fix <value>`       | Label for fixes pull requests                                       |
| `--labels.release <value>`   | Label for releases pull requests                                    |
| `--labels.wip <value>`       | Label for unfinished pull requests                                  |
| `--no-release`               | Skip tag/release creation (for fixes/hotfixes)                      |
| `--owner <value>`            | Repository owner                                                    |
| `--repo <value>`             | Repository name                                                     |
| `--tag <value>`              | Tags prefix                                                         |
| `--token <value>`            | GitHub access token                                                 |
| `--verbose`                  | Log requests & full errors                                          |

### Commands
#### Changes
Display the changelog for the next beta or stable release.

`releaseman changes start|finish [options]`

| CLI      | Description                |
| -------- | -------------------------- |
| `finish` | Use latest beta and master |
| `start`  | Use develop and master     |

#### Continue
Re-run the last command starting where it failed.

`releaseman continue`

#### Feature
Start, publish or finish a feature.

`releaseman feature ((start|publish) <name>)|(finish <number>) [options]`

| CLI        | Description                      |
| ---------- | -------------------------------- |
| `finish`   | Merge the feature into develop   |
| `publish`  | Create the pull request          |
| `start`    | Create a new branch from develop |
| `<name>`   | Feature name                     |
| `<number>` | Feature pull request number      |

#### Fix
Start, publish or finish a fix.

`releaseman fix ((start|publish) <name>)|(finish <number>) [options]`

| CLI        | Description                                           |
| ---------- | ----------------------------------------------------- |
| `finish`   | Merge the fix into the release branch and backport it |
| `publish`  | Create the pull request                               |
| `start`    | Create a new branch from the release branch           |
| `<name>`   | Fix name                                              |
| `<number>` | Fix pull request number                               |

#### Help
Display help on `releaseman`'s usage.

`releaseman help [<command>]`

| CLI         | Description                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------ |
| `<command>` | Command on which to display help: changes, continue, feature, fix, help, hotfix, init or release |

#### Hotfix
Start, publish or finish a hotfix.

`releaseman hotfix ((start|publish) <name>)|(finish <number>) [options]`

| CLI        | Description                                  |
| ---------- | -------------------------------------------- |
| `finish`   | Merge the hotfix into master and backport it |
| `publish`  | Create the pull request                      |
| `start`    | Create a new branch from master              |
| `<name>`   | Hotfix name                                  |
| `<number>` | Hotfix pull request number                   |

#### Init
Make your repository ready for `releaseman` by creating develop and latest-beta branches, an initial release and labels.

`releaseman init`

#### Release
Create a new beta or stable release.
The `<name>` param is used as the new release's name.
It is used only when creating a new beta since the stable release will reuse it's beta name.

`releaseman release (start <name>)|finish [options]`

| CLI      | Description                 |
| -------- | --------------------------- |
| `finish` | Create a new stable release |
| `start`  | Create a new beta release   |
| `<name>` | Release name                |

## Typical workflow
Using releaseman from it's cloned folder without `repo` specified in the `defaults.json`

### Start the release process
`./bin/releaseman release start <Release Name> --repo <repository-name>`

At this point, if some PRs were mis-labeled, `releaseman` will probably crash.
Don't worry, the `continue` command is made for this, you can fix the labels
in GitHub and run

`./bin/releaseman continue`

`releaseman` will skip all the steps before the one it crashed on and runs with the same options as before.

### Deploy release branch and test (optional)
If some fixes need to be done here, create a fix branch with

`./bin/releaseman fix start <Fix Name> --repo <repository-name>`

It will create a `fix/<fix-name>` branch.
Make your fixes on it, then create a PR with

`./bin/releaseman fix publish <Fix Name> --repo <repository-name>`

Then merge it using

`./bin/releaseman fix finish <pr-number> --repo <repository-name>`

### Finish the release process.
`./bin/releaseman release finish --repo <repository-name>`
