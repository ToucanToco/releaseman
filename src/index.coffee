import Config from './config'
import Errors from './errors'
import GitHub from './github'
import Man from './man'
import Package from '../package'

_ = require('lodash')
args = require('yargs').argv

_chainBackport = ({ base, head, isNext = true } = {}) ->
  if isNext
    _logDone()

  _logTask("Backport `#{head}` into `#{base}`")

  return github
    .commits
    .merge(
      base: base
      head: head
    )
_chainBranchesDelete = ({ branch, isNext = true } = {}) ->
  if isNext
    _logDone()

  _logTask("Delete branch `#{branch}`")

  return github
    .branches
    .delete({ branch: branch })
    .catch (e) ->
      if _.isEqual(
        JSON.parse(e.message).message
        'Reference does not exist'
      )
      then _log("The branch `#{branch}` was already deleted", 'warn')
      else throw Errors.default(e)
_chainCommitsGetChangelog = ({ base, head, isNext = true } = {}) ->
  if isNext
    _logDone()

  _logTask("Get changelog for `#{head}` since `#{base}`")

  return github
    .commits
    .getChangelog(
      base: base
      head: head
    )
    .then (changelog) ->
      _log(
        changelog.text
        if _.isEmpty(changelog.labels) then 'warn' else 'info'
      )

      return changelog
_chainEnd = ({ isNext = true, script } = {}) ->
  if isNext
    _logDone()

  _logScript(
    isEnd: true
    script: script
  )
_chainIssuesSetLabel = ({ isNext = true, label, number } = {}) ->
  if isNext
    _logDone()

  _logTask("Set issue ##{number}'s labels to ['#{label}']")

  return github
    .issues
    .setLabels(
      labels: [label]
      number: number
    )
_chainPullRequestsDelayMergeState = ({ isNext = true, pr } = {}) ->
  if isNext
    _logDone()

  _logTask("Wait for the PR ##{pr.number} to have a non-`null` mergeable state")

  return _delay(
    query: ->
      github
        .pullRequests
        .get({ number: pr.number })
    res: pr
    test: (res) ->
      isRetry = _.isNull(res.mergeable)

      if isRetry
        _log('Mergeable state is `null`, retry...', 'info')

      return not isRetry
  )
_chainPullRequestsGet = ({ isNext = true, number } = {}) ->
  if isNext
    _logDone()

  _logTask("Get PR ##{number}")

  return github
    .pullRequests
    .get({ number: number })
_chainPullRequestsMerge = ({
  base, isNext = true, method = 'merge', pr, prefix
} = {}) ->
  if isNext
    _logDone()

  _logTask("Merge PR ##{pr.number}")

  if (
    not _.isUndefined(base) and not _.isEqual(pr.base.ref, base)
  ) or (
    not _.isUndefined(prefix) and not (
      if _.isArray(prefix)
      then _.some(prefix, (p) -> _.startsWith(pr.head.ref, p))
      else _.startsWith(pr.head.ref, prefix)
    )
  )
    throw Errors.mergeApocalypse(pr.head.ref, pr.base.ref)

  if pr.merged
    _log("The PR ##{pr.number} was already merged", 'warn')

    return Promise.resolve(pr)

  unless pr.mergeable
    throw Errors.unmergeable(pr.number)

  return github
    .pullRequests
    .merge(
      method: method
      number: pr.number
    )
_chainReleasesCreate = ({
  changelog, isBeta = false, isFix = false, isNext = true, release
} = {}) ->
  if isNext
    _logDone()

  if isBeta
    head = 'next'
    logName = 'beta'
    nameTest = /^(.*?\sbeta)\s?\d*$/
    tagTest = /^(v.*?-beta)\.?(\d*)$/
  else
    head = 'master'
    logName = 'release'
    nameTest = /^(.*?)\s?\d*$/
    tagTest = /^(v.*?)\.(\d+)$/

  _logTask("Create a new #{logName}")

  if _.isEmpty(changelog.labels)
    throw Errors.noNewPR(head, release.tag_name)

  if isFix
    nameMatch = nameTest.exec(release.name)
    tagMatch = tagTest.exec(release.tag_name)

    fix = _.chain(tagMatch)
      .get(2)
      .toNumber()
      .add(1)
      .value()

    name = "#{_.get(nameMatch, 1)} #{fix}"
    tagName = "#{_.get(tagMatch, 1)}.#{fix}"
  else if isBeta
    isBreaking = _.includes(changelog.labels, 'breaking')
    tagMatch = /^v(\d+)\.(\d+)\.\d+$/.exec(release.tag_name)

    major = if isBreaking then (
      _.chain(tagMatch)
        .get(1)
        .toNumber()
        .add(1)
        .value()
    ) else _.get(tagMatch, 1)
    minor = if isBreaking then 0 else (
      _.chain(tagMatch)
        .get(2)
        .toNumber()
        .add(1)
        .value()
    )

    name = "#{config.name} beta"
    tagName = "v#{major}.#{minor}.0-beta"
  else
    name = _.get(/^(.*?)\sbeta\s?\d*$/.exec(release.name), 1)
    tagName = _.get(/^(v.*?)-beta\.?\d*$/.exec(release.tag_name), 1)

  _log("Creating #{logName} '#{name}' with tag `#{tagName}`", 'info')

  return github
    .releases
    .create(
      branch: head
      changelog: changelog.text
      isBeta: isBeta
      name: name
      tagName: tagName
    )
_chainReleasesCreatePullRequest = ({
  changelog, isBeta = false, isNext = true
} = {}) ->
  if isNext
    _logDone()

  if isBeta
    base = 'next'
    head = 'dev'
    logName = 'beta'
  else
    base = 'master'
    head = 'next'
    logName = 'release'

  _logTask("Create (or update) the next #{logName}\'s PR")

  if _.isEmpty(changelog.labels)
    throw Errors.noNewPR(head, base)

  return github
    .pullRequests
    .createOrUpdate(
      base: base
      body: changelog.text
      head: head
      title: "Next #{logName}"
    )
_chainReleasesGetLatest = ({ isBeta = false, isNext = true } = {}) ->
  if isNext
    _logDone()

  _logTask("Get latest #{if isBeta then 'beta' else 'release'}")

  return github
    .releases
    .getLatest({ isBeta: isBeta })
_delay = ({ counter, query, res, test }) ->
  if _.gt(counter, 10)
    throw Errors.tooManyTries()

  return new Promise (resolve) ->
    if test(res)
    then resolve(res)
    else setTimeout(->
      resolve(
        query()
          .then (newRes) ->
            _delay(
              counter: _.add(counter, 1)
              query: query
              res: newRes
              test: test
            )
      )
    , 1000)
_log = (message, type) ->
  color =
    switch type
      when 'error' then '\x1b[31m'
      when 'hint' then '\x1b[2m'
      when 'info' then '\x1b[36m'
      when 'success' then '\x1b[32m'
      when 'warn' then '\x1b[33m'
      else '\x1b[0m'

  return console.log("#{color}%s\x1b[0m", message)
_logDone = ->
  _log('Done.\n', 'success')
_logScript = ({ isEnd = false, script } = {}) ->
  logPosition = if isEnd then 'END' else 'START'
  logScript = _.toUpper(script)

  logPad = _.pad("### #{logPosition} #{logScript} SCRIPT ###", 79, '#')

  return _log("#{logPad}\n")
_logTask = (task) ->
  _log(_.padEnd("TASK: [#{task}] ***", 79, '*'))
_runFix = ({ isHot = false } = {}) ->
  if isHot
    base = 'master'
    backportTo = 'next'
    prefix = [
      'doc/'
      'hotfix/'
    ]
    script = 'hotfix'
  else
    base = 'next'
    backportTo = 'dev'
    prefix = 'fix/'
    script = 'fix'

  _logScript({ script: script })

  if _.isUndefined(config.pr)
    throw Errors.mandatoryArg('pr')

  return _chainIssuesSetLabel(
    isNext: false
    label: 'bug'
    number: config.pr
  )
    .then ->
      _chainPullRequestsGet({ number: config.pr })
    .then (pr) ->
      _chainPullRequestsMerge(
        base: base
        method: 'squash'
        pr: pr
        prefix: prefix
      )
        .then ->
          pr
    .then (pr) ->
      _chainBranchesDelete({ branch: pr.head.ref })
    .then ->
      _chainReleasesGetLatest({ isBeta: not isHot })
    .then (release) ->
      _chainCommitsGetChangelog({
        base: release.tag_name
        head: base
      })
        .then (changelog) ->
          [release, changelog]
    .then ([release, changelog]) ->
      _chainReleasesCreate(
        changelog: changelog
        isBeta: not isHot
        isFix: true
        release: release
      )
    .then ->
      _chainBackport(
        base: backportTo
        head: base
      )
    .then ->
      if isHot
      then (
        _chainReleasesGetLatest({ isBeta: true })
          .then (release) ->
            _chainCommitsGetChangelog(
              base: release.tag_name
              head: backportTo
            )
              .then (changelog) ->
                [release, changelog]
          .then ([release, changelog]) ->
            _chainReleasesCreate(
              changelog: changelog
              isBeta: true
              isFix: true
              release: release
            )
          .then ->
            _chainBackport(
              base: 'dev'
              head: backportTo
            )
          .then ->
            _chainEnd({ script: script })
      )
      else _chainEnd({ script: script })
_runHelp = ->
  Promise.resolve(_log(Man, 'info'))
_runInfo = ->
  _logScript({ script: 'info' })

  if _.isEqual(config.release, 'release')
    base = 'master'
    head = 'next'
  else
    base = 'next'
    head = 'dev'

  return _chainCommitsGetChangelog(
    base: base
    head: head
    isNext: false
  )
    .then ->
      _chainEnd({ script: 'info' })
_runRelease = ({ isBeta = false } = {}) ->
  if isBeta
    base = 'next'
    head = 'dev'
    script = 'beta'
  else
    base = 'master'
    head = 'next'
    script = 'release'

  _logScript({ script: script })

  if isBeta
    if _.isEmpty(config.name)
      throw Errors.mandatoryArg('name')
    if (
      _.chain(config.name)
        .words()
        .includes('beta')
        .value()
    )
      throw Errors.betaName()

  return _chainCommitsGetChangelog(
    base: base
    head: head
    isNext: false
  )
    .then (changelog) ->
      _chainReleasesCreatePullRequest(
        changelog: changelog
        isBeta: isBeta
      )
        .then (pr) ->
          [changelog, pr]
    .then ([changelog, pr]) ->
      _chainIssuesSetLabel(
        label: 'release'
        number: pr.number
      )
        .then ->
          [changelog, pr]
    .then ([changelog, pr]) ->
      _chainPullRequestsDelayMergeState({ pr: pr })
        .then (prWithMergeState) ->
          [changelog, prWithMergeState]
    .then ([changelog, pr]) ->
      _chainPullRequestsMerge({ pr: pr })
        .then ->
          changelog
    .then (changelog) ->
      _chainReleasesGetLatest({ isBeta: not isBeta })
        .then (release) ->
          [changelog, release]
    .then ([changelog, release]) ->
      _chainReleasesCreate(
        changelog: changelog
        isBeta: isBeta
        release: release
      )
    .then ->
      _chainEnd({ script: script })

_log("#{Package.name} v#{Package.version}\n", 'hint')

config = Config(args)
github = GitHub(config)

if _.isUndefined(args.repo) and _.includes([
  'beta'
  'fix'
  'hotfix'
  'info'
  'release'
], config.type)
  _log(Errors.mandatoryArg('repo'), 'error')

  throw 1

(
  switch config.type
    when 'beta' then _runRelease({ isBeta: true })
    when 'fix' then _runFix()
    when 'hotfix' then _runFix({ isHot: true })
    when 'info' then _runInfo()
    when 'release' then _runRelease()
    else _runHelp()
).catch (e) ->
  setTimeout(->
    _log(e, 'error')

    throw 1
  , 0)
