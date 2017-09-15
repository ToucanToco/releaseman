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

Creating a new beta

- Creates or updates the PR for `dev` into `next`
- Merges the PR
- Creates a new release in Github (from `next` using `<name>`)

### Fix
`fix <pr>`

Applying a fix

- Updates the PR #`<pr>` (sets labels to `['bug']`)
- Squash merges the PR into `next`
- Deletes the branch
- Creates a new release in Github (from `next`)
- Merges `next` into `dev`

### Help
`help`

Displaying the man

### Hotfix
`hotfix <pr>`

Applying a fix

- Updates the PR #`<pr>` (sets labels to `['bug']`)
- Squash merges the PR into `master`
- Deletes the branch
- Creates a new release in Github (from `master`)
- Merges `master` into `next`
- Creates a new release in Github (from `next`)
- Merges `next` into `dev`

### Info
`info <release>`

Getting the changelog for the next beta or release (depending on `<release>`, default is release)

### Release
`release`

Creating a new release

- Creates or update the PR for `next` into `master`
- Merges the PR
- Creates a new release in Github (from `master`)
