_ = require('lodash')

Config = (argv) ->
  secondArg = _.get(argv._, 1)

  return (
    branches: [
      'dev'
      'next'
      'master'
    ],
    categories: [
      label: 'breaking'
      title: 'Breaking changes'
    ,
      label: 'feature'
      title: 'New features'
    ,
      label: 'bug'
      title: 'Fixes'
    ,
      label: 'doc'
      title: 'Doc'
    ,
      label: 'tech'
      title: 'Miscellanous'
    ]
    name: (
      _.chain(argv._)
        .tail()
        .join(' ')
        .value()
    ),
    owner: if _.isUndefined(argv.owner) then 'toucantoco' else argv.owner
    pr: secondArg
    release: if _.isUndefined(secondArg) then 'release' else secondArg
    repo: argv.repo
    type: _.get(argv._, 0)
  )

export default Config
