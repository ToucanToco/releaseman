# Releaseman
Automatic releases script

## Installation
- Copy `auth.json.dist` as `auth.json`
- Get ToucanTokar's access token from Lastpass
- Write the access token in `auth.json` as `<your-token>`
- Run `yarn`
- You now have a executable file at `./bin/releaseman`

## Usage
`releaseman <command> [--owner=<owner>] [--repo=<repo>]`

- `<command>` Available commands (default: 'help')
  - [`beta <name>`](#beta)
  - [`fix <pr>`](#fix)
  - [`help`](#help)
  - [`hotfix <pr>`](#hotfix)
  - [`info <release>`](#info)
  - [`release`](#release)
- `<name>` The release's name
- `<owner>` The repository owner (default: 'toucantoco')
- `<pr>` The Pull Request's number
- `<release>` On which to get info (default: 'release')
  - `beta`
  - `release`
- `<repo>` The repository's name (default: 'tucana')

### Beta
`beta <name>`

Create a new beta

- Create or update the PR for `dev` into `next`
- Merge the PR
- Create a new release in Github (from `next` using `<name>`)

### Fix
`fix <pr>`

Apply a fix

- Update the PR #`<pr>` (set labels to `['bug']`)
- Squash merge the PR into `next`
- Delete the branch
- Create a new release in Github (from `next`)
- Merge `next` into `dev`

### Help
`help`

Display the man

### Hotfix
`hotfix <pr>`

Apply a fix

- Update the PR #`<pr>` (set labels to `['bug']`)
- Squash merge the PR into `master`
- Delete the branch
- Create a new release in Github (from `master`)
- Merge `master` into `next`
- Create a new release in Github (from `next`)
- Merge `next` into `dev`

### Info
`info <release>`

Get the changelog for the next beta or release (depending on `<release>`, default is release)

### Release
`release`

Create a new release

- Create or update the PR for `next` into `master`
- Merge the PR
- Create a new release in Github (from `master`)
