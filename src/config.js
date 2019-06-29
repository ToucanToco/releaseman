import Defaults from './defaults'
import fs from 'fs'
import get from 'lodash/fp/get'
import merge from 'lodash/fp/merge'

const Config = (argv) => {
  let defaults = Defaults

  if (argv.defaults !== undefined) {
    if (!fs.existsSync(argv.defaults)) {
      throw 'The <defaults> file doesn\'t exist!'
    }

    defaults = merge(defaults)(JSON.parse(fs.readFileSync(argv.defaults)))
  }

  const getArgOrDefault = (key, parseArg = (value) => value) => {
    const value = get(key)(argv)

    return (
      value === undefined
        ? get(key)(defaults)
        : parseArg(value)
    )
  }

  return {
    base: argv._[1],
    branches: {
      alpha: getArgOrDefault('branches.alpha'),
      beta: getArgOrDefault('branches.beta'),
      develop: getArgOrDefault('branches.develop'),
      master: getArgOrDefault('branches.master')
    },
    categories: getArgOrDefault('categories', JSON.parse),
    command: argv._[0],
    head: argv._[2],
    helpOn: argv._[1],
    isRelease: argv.release,
    isVerbose: argv.verbose,
    labels: {
      breaking: getArgOrDefault('labels.breaking'),
      release: getArgOrDefault('labels.release')
    },
    mode: argv._[1],
    name: (
      argv._.length < 3
        ? undefined
        : argv._
          .slice(2)
          .join(' ')
    ),
    number: argv._[2],
    owner: getArgOrDefault('owner'),
    repo: getArgOrDefault('repo'),
    tag: getArgOrDefault('tag'),
    token: getArgOrDefault('token')
  }
}

export default Config
