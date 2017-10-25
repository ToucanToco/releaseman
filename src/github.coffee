import Auth from './auth'

_ = require('lodash')
GitHubApi = require('github')

GitHub = (config) ->
  _fetchGitHub = (methodPath) -> (params) ->
    _.get(_gitHubApi, methodPath)(_.assign({}, _params, params))
      .then (res) ->
        res.data
  _gitHubApi = new GitHubApi(
    followRedirects: false
    headers:
      'user-agent': 'Toucan Toco release'
    host: 'api.github.com'
    Promise: Promise
    protocol: 'https'
    timeout: 5000
  )
  _params =
    owner: config.owner
    repo: config.repo

  _gitHubApi.authenticate(
    token: Auth.token
    type: 'oauth'
  )

  return (
    branches:
      delete: ({ branch }) ->
        _fetchGitHub('gitdata.deleteReference')({ ref: "heads/#{branch}" })
    commits:
      getChangelog: ({ base, head }) ->
        _fetchGitHub('repos.compareCommits')(
          base: base
          head: head
        )
          .then (diff) ->
            matchPRNumber = /^.*?\(#(\d+)\)/

            return Promise.all(
              _.chain(diff.commits)
                .map (commit) ->
                  _.get(matchPRNumber.exec(commit.commit.message), 1)
                .without(undefined)
                .map (number) ->
                  _fetchGitHub('issues.get')({ number: number })
                .value()
            )
          .then (issues) ->
            changelogIssues = _.map(issues, (issue) ->
              changelog: "##{issue.number} #{issue.title}"
              labels: _.map(issue.labels, 'name')
            )
            categoriesLabels = _.map(config.categories, 'label')

            uncategorizedChangelogIssues =
              _.reject(changelogIssues, (changlogIssue) ->
                _.some(categoriesLabels, (categoryLabel) ->
                  _.includes(changlogIssue.labels, categoryLabel)
                )
              )

            unless _.isEmpty(uncategorizedChangelogIssues)
              return Promise.reject("#{
                if _.size(uncategorizedChangelogIssues) is 1
                then 'This PR is missing a label'
                else 'These PRs are missing a label'
              }:\n#{
                _.chain(uncategorizedChangelogIssues)
                  .map('changelog')
                  .join('\n')
                  .value()
              }")

            return _.chain(config.categories)
              .map (category) ->
                _.assign({}, category, {
                  issues: (
                    _.chain(changelogIssues)
                      .filter (issue) ->
                        _.includes(issue.labels, category.label)
                      .map('changelog')
                      .value()
                  )
                })
              .filter (category) ->
                not _.isEmpty(category.issues)
              .thru (categories) ->
                labels: _.map(categories, 'label')
                text: if _.isEmpty(categories) then 'No new PR' else (
                  _.chain(categories)
                    .map (category) ->
                      "## #{category.title}\n#{_.join(category.issues, '\n')}"
                    .join('\n\n')
                    .value()
                )
              .value()
      merge: _fetchGitHub('repos.merge')
    issues:
      setLabels: _fetchGitHub('issues.replaceAllLabels')
    pullRequests:
      createOrUpdate: ({ base, body, head, title }) ->
        _fetchGitHub('pullRequests.getAll')(
          base: base
          head: "#{config.owner}:#{head}"
        )
          .then (prs) ->
            _.chain(prs)
              .find (pr) ->
                _.isEqual(pr.state, 'open')
              .thru (pr) ->
                if _.isUndefined(pr)
                then _fetchGitHub('pullRequests.create')(
                  base: base
                  body: body
                  head: head
                  title: title
                )
                else _fetchGitHub('pullRequests.update')(
                  body: body
                  number: pr.number
                  title: title
                )
              .value()
      get: _fetchGitHub('pullRequests.get')
      merge: ({ method = 'merge', number } = {}) ->
        _fetchGitHub('pullRequests.merge')(
          merge_method: method
          number: number
        )
    releases:
      create: ({ branch, changelog, isBeta = false, name, tagName } = {}) ->
        _fetchGitHub('repos.createRelease')(
          body: changelog
          name: name
          prerelease: isBeta
          tag_name: tagName
          target_commitish: branch
        )
      getLatest: ({ isBeta = false } = {}) ->
        _fetchGitHub('repos.getReleases')()
          .then (releases) ->
            _.find(releases, (release) ->
              _.isEqual(release.prerelease, isBeta) and not release.draft
            )
  )

export default GitHub
