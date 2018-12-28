import assign from 'lodash/fp/assign'
import concat from 'lodash/fp/concat'
import fetch from 'node-fetch'
import filter from 'lodash/fp/filter'
import first from 'lodash/fp/first'
import flow from 'lodash/fp/flow'
import get from 'lodash/fp/get'
import includes from 'lodash/fp/includes'
import isEmpty from 'lodash/fp/isEmpty'
import isEqual from 'lodash/fp/isEqual'
import isUndefined from 'lodash/fp/isUndefined'
import join from 'lodash/fp/join'
import map from 'lodash/fp/map'
import reject from 'lodash/fp/reject'
import size from 'lodash/fp/size'
import some from 'lodash/fp/some'

const GitHub = (config) => {
  const baseUrl = `https://github.com/${config.owner}/${config.repo}/`
  const headers = {
    Authorization: `token ${config.token}`,
    'content-type': 'application/json'
  }

  const fetchGitHub = (path, method = 'GET', body) => fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/${path}`,
    {
      body: JSON.stringify(body),
      headers: headers,
      method: method
    }
  )
    .then((res) => {
      if (isEqual(204)(res.status)) {
        return {
          data: {},
          isSuccess: true
        }
      }

      return res.json()
        .then((data) => ({
          data: data,
          isSuccess: res.ok
        }))
    })
    .then(({ data, isSuccess }) => {
      if (isSuccess) {
        return data
      }

      return Promise.reject(data.message)
    })

  const github = {
    branches: {
      create: ({ base, head }) => (
        fetchGitHub(`git/refs/heads/${base}`)
          .then(({ object }) => fetchGitHub('git/refs', 'POST', {
            ref: `refs/heads/${head}`,
            sha: object.sha
          }))
          .then(() => ({
            branch: head,
            url: `${baseUrl}tree/${head}`
          }))
      ),
      delete: ({ branch }) => (
        fetchGitHub(`git/refs/heads/${branch}`, 'DELETE')
          .then(() => true)
      ),
      getExistence: ({ name }) => (
        fetchGitHub(`git/refs/heads/${name}`)
          .then(() => true)
          .catch((message) => {
            if (isEqual('Not Found')(message)) {
              return false
            }

            return Promise.reject(message)
          })
      ),
      merge: ({ base, head }) => (
        fetchGitHub('merges', 'POST', {
          base: base,
          head: head
        })
          .then(({ commit, html_url }) => ({
            message: commit.message,
            url: html_url
          }))
      ),
      update: ({ base, head }) => (
        fetchGitHub(`git/refs/heads/${head}`)
          .then(({ object }) => fetchGitHub(`git/refs/heads/${base}`, 'PATCH', {
            sha: object.sha
          }))
          .then(() => ({ url: `${baseUrl}tree/${base}` }))
      )
    },
    commits: {
      getChangelog: ({ base, head }) => (
        fetchGitHub(`compare/${base}...${head}`)
          .then(({ commits }) => {
            const matchPRNumber = new RegExp('^.*?\\(#(\\d+)\\)')

            return Promise.all(flow(
              map(({ commit }) => get(1)(matchPRNumber.exec(commit.message))),
              reject(isUndefined),
              map((number) => github.pullRequests.getChangelog({
                number: number
              }))
            )(commits))
          })
          .then((pullRequests) => {
            const categoriesLabels = flow(
              map('label'),
              concat(config.labels.release)
            )(config.categories)

            const uncategorizedPullRequests = reject(({ labels }) => (
              some((categoryLabel) => (
                includes(categoryLabel)(labels)
              ))(categoriesLabels)
            ))(pullRequests)

            if (isEmpty(uncategorizedPullRequests)) {
              return flow(
                map((category) => (
                  assign(category)({
                    pullRequests: flow(
                      filter(({ labels }) => includes(category.label)(labels)),
                      map('text')
                    )(pullRequests)
                  })
                )),
                reject(({ pullRequests }) => isEmpty(pullRequests)),
                (categories) => ({
                  labels: map('label')(categories),
                  text: (
                    isEmpty(categories)
                      ? 'No new PR'
                      : flow(
                        map(({ pullRequests, title }) => (
                          `## ${title}\n${join('\n')(pullRequests)}`
                        )),
                        join('\n\n')
                      )(categories)
                  )
                })
              )(config.categories)
            }

            return Promise.reject(`${
              isEqual(1)(size(uncategorizedPullRequests))
                ? 'This PR is missing a label'
                : 'These PRs are missing a label'
            }:\n${flow(
              map('text'),
              join('\n')
            )(uncategorizedPullRequests)}`)
          })
      )
    },
    labels: {
      create: ({ color, name }) => (
        fetchGitHub('labels', 'POST', {
          color: color,
          name: name
        })
          .then(({ name }) => ({
            name: name,
            url: `${baseUrl}labels/${name}`
          }))
      ),
      index: () => (
        fetchGitHub('labels')
          .then(map(({ color, name }) => ({
            color: color,
            name: name
          })))
      )
    },
    pullRequests: {
      create: ({ base, changelog, head, name }) => (
        fetchGitHub('pulls', 'POST', {
          base: base,
          body: changelog,
          head: head,
          title: name
        })
          .then(({ number, html_url }) => ({
            number: number,
            url: html_url
          }))
      ),
      find: ({ base, head }) => (
        fetchGitHub(`pulls?base=${base}&head=${config.owner}:${head}`)
          .then(first)
          .then(({ number }) => ({ number: number }))
      ),
      get: ({ number }) => (
        fetchGitHub(`pulls/${number}`)
          .then(({ base, head, mergeable, merged, title }) => ({
            base: base.ref,
            head: head.ref,
            isMergeable: mergeable,
            isMerged: merged,
            name: title
          }))
      ),
      getChangelog: ({ number }) => (
        fetchGitHub(`issues/${number}`)
          .then(({ labels, number, title }) => ({
            labels: map('name')(labels),
            text: `#${number} ${title}`
          }))
      ),
      getLabels: ({ number }) => (
        fetchGitHub(`issues/${number}/labels`)
          .then(map(({ color, name }) => ({
            color: color,
            name: name
          })))
      ),
      merge: ({ message, method, number }) => (
        fetchGitHub(`pulls/${number}/merge`, 'PUT', {
          commit_title: message,
          merge_method: method
        })
          .then(() => ({ url: `${baseUrl}pull/${number}` }))
      ),
      setLabels: ({ labels, number }) => (
        fetchGitHub(`issues/${number}/labels`, 'PUT', labels)
          .then(() => ({ url: `${baseUrl}pull/${number}` }))
      ),
      update: ({ changelog, name, number }) => (
        fetchGitHub(`pulls/${number}`, 'PATCH', {
          body: changelog,
          title: name
        })
          .then(({ html_url }) => ({ url: html_url }))
      )
    },
    releases: {
      create: ({ branch, changelog, isPrerelease = false, name, tag }) => (
        fetchGitHub('releases', 'POST', {
          body: changelog,
          name: name,
          prerelease: isPrerelease,
          tag_name: tag,
          target_commitish: branch
        })
          .then(({ html_url }) => ({
            tag: tag,
            url: html_url
          }))
      ),
      getLatest: ({ isPrerelease = false } = {}) => (
        (
          isPrerelease
            ? (
              fetchGitHub('releases')
                .then(flow(
                  filter('prerelease'),
                  first
                ))
            )
            : fetchGitHub('releases/latest')
        )
          .then(({ name, tag_name }) => ({
            name: name,
            tag: tag_name
          }))
      ),
      size: ({ isPrerelease = false } = {}) => (
        fetchGitHub('releases')
          .then(flow(
            (
              isPrerelease
                ? filter('prerelease')
                : reject('prerelease')
            ),
            size
          ))
      )
    }
  }

  return github
}

export default GitHub
