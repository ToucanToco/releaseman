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

  const fetchGitHub = async (path, method = 'GET', body) => {
    const res = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/${path}`,
      {
        body: JSON.stringify(body),
        headers: headers,
        method: method
      }
    )

    if (isEqual(204)(res.status)) {
      return {}
    }

    const data = await res.json()

    if (res.ok) {
      return data
    }

    throw data.message
  }

  const github = {
    branches: {
      create: async ({ base, head }) => {
        const { object } = await fetchGitHub(`git/refs/heads/${base}`)

        await fetchGitHub('git/refs', 'POST', {
          ref: `refs/heads/${head}`,
          sha: object.sha
        })

        return {
          name: head,
          url: `${baseUrl}tree/${head}`
        }
      },
      delete: async ({ name }) => {
        await fetchGitHub(`git/refs/heads/${name}`, 'DELETE')

        return true
      },
      getExistence: async ({ name }) => {
        try {
          await fetchGitHub(`git/refs/heads/${name}`)
        } catch (message) {
          if (isEqual('Not Found')(message)) {
            return false
          }

          throw message
        }

        return true
      },
      merge: async ({ base, head }) => {
        const { commit, html_url } = await fetchGitHub('merges', 'POST', {
          base: base,
          head: head
        })

        return {
          message: commit.message,
          url: html_url
        }
      },
      update: async ({ base, head }) => {
        const { object } = await fetchGitHub(`git/refs/heads/${head}`)

        await fetchGitHub(`git/refs/heads/${base}`, 'PATCH', {
          sha: object.sha
        })

        return { url: `${baseUrl}tree/${base}` }
      }
    },
    commits: {
      getChangelog: async ({ base, head }) => {
        const categoriesLabels = flow(
          map('label'),
          concat(config.labels.release)
        )(config.categories)
        const matchPRNumber = new RegExp('^.*?\\(#(\\d+)\\)')

        const { commits } = await fetchGitHub(`compare/${base}...${head}`)

        const pullRequests = await Promise.all(flow(
          map(({ commit }) => get(1)(matchPRNumber.exec(commit.message))),
          reject(isUndefined),
          map((number) => github.pullRequests.getChangelog({
            number: number
          }))
        )(commits))

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

        throw `${
          isEqual(1)(size(uncategorizedPullRequests))
            ? 'This PR is missing a label'
            : 'These PRs are missing a label'
        }:\n${flow(
          map('text'),
          join('\n')
        )(uncategorizedPullRequests)}`
      }
    },
    labels: {
      create: async ({ color, name }) => {
        await fetchGitHub('labels', 'POST', {
          color: color,
          name: name
        })

        return {
          name: name,
          url: `${baseUrl}labels/${name}`
        }
      },
      index: async () => {
        const labels = await fetchGitHub('labels')

        return map(({ color, name }) => ({
          color: color,
          name: name
        }))(labels)
      }
    },
    pullRequests: {
      create: async ({ base, changelog, head, name }) => {
        const { number, html_url } = await fetchGitHub('pulls', 'POST', {
          base: base,
          body: changelog,
          head: head,
          title: name
        })

        return {
          number: number,
          url: html_url
        }
      },
      find: async ({ base, head }) => {
        const pullRequests = await fetchGitHub(
          `pulls?base=${base}&head=${config.owner}:${head}`
        )

        const number = flow(
          first,
          get('number')
        )(pullRequests)

        if (isUndefined(number)) {
          return undefined
        }

        const { isMergeable, isMerged, name } = await github.pullRequests.get({
          number: number
        })

        return {
          isMergeable: isMergeable,
          isMerged: isMerged,
          name: name,
          number: number
        }
      },
      get: async ({ number }) => {
        const {
          base,
          head,
          mergeable,
          merged,
          title
        } = await fetchGitHub(`pulls/${number}`)

        return {
          base: base.ref,
          head: head.ref,
          isMergeable: mergeable,
          isMerged: merged,
          name: title
        }
      },
      getChangelog: async ({ number }) => {
        const { labels, title } = await fetchGitHub(`issues/${number}`)

        return {
          labels: map('name')(labels),
          text: `#${number} ${title}`
        }
      },
      getLabels: async ({ number }) => {
        const labels = await fetchGitHub(`issues/${number}/labels`)

        return map(({ color, name }) => ({
          color: color,
          name: name
        }))(labels)
      },
      merge: async ({ message, method, number }) => {
        await fetchGitHub(`pulls/${number}/merge`, 'PUT', {
          commit_title: message,
          merge_method: method
        })

        return { url: `${baseUrl}pull/${number}` }
      },
      setLabels: async ({ labels, number }) => {
        await fetchGitHub(`issues/${number}/labels`, 'PUT', {
          labels: labels
        })

        return { url: `${baseUrl}pull/${number}` }
      },
      update: async ({ changelog, name, number }) => {
        const { html_url } = await fetchGitHub(`pulls/${number}`, 'PATCH', {
          body: changelog,
          title: name
        })

        return { url: html_url }
      }
    },
    releases: {
      create: async ({
        branch,
        changelog,
        isPrerelease = false,
        name,
        tag
      }) => {
        const { html_url } = await fetchGitHub('releases', 'POST', {
          body: changelog,
          name: name,
          prerelease: isPrerelease,
          tag_name: tag,
          target_commitish: branch
        })

        return {
          tag: tag,
          url: html_url
        }
      },
      getLatest: async ({ isPrerelease = false } = {}) => {
        let release = {}

        if (isPrerelease) {
          const releases = await fetchGitHub('releases')

          release = flow(
            filter('prerelease'),
            first
          )(releases)
        } else {
          release = await fetchGitHub('releases/latest')
        }

        return {
          name: release.name,
          tag: release.tag_name
        }
      },
      size: async ({ isPrerelease = false } = {}) => {
        const releases = await fetchGitHub('releases')

        return flow(
          (
            isPrerelease
              ? filter
              : reject
          )('prerelease'),
          size
        )(releases)
      }
    }
  }

  return github
}

export default GitHub
