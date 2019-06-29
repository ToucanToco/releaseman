/* eslint-disable camelcase */
import fetch from 'node-fetch'
import { logHint } from './log'

const getNewId = () => {
  getNewId.id = getNewId.id + 1

  return getNewId.id
}
getNewId.id = -1

const GitHub = (config) => {
  const baseUrl = `https://github.com/${config.owner}/${config.repo}/`
  const headers = {
    Authorization: `token ${config.token}`,
    'content-type': 'application/json'
  }

  const fetchGitHub = async (path, method = 'GET', body) => {
    const id = getNewId()
    const url = (
      `https://api.github.com/repos/${config.owner}/${config.repo}/${path}`
    )

    if (config.isVerbose) {
      logHint(`Fetch #${id}: ${JSON.stringify({
        url,
        method,
        body
      }, null, 2)}`)
    }

    const res = await fetch(url, {
      body: JSON.stringify(body),
      headers,
      method
    })

    if (config.isVerbose) {
      logHint(`Fetch #${id} status: ${res.status}`)
    }
    if (res.status === 204) {
      return {}
    }

    const data = await res.json()

    if (res.ok) {
      return data
    }

    throw (
      config.isVerbose
        ? `Fetch #${id} error: ${JSON.stringify(data, null, 2)}`
        : data.message
    )
  }

  const github = {
    branches: {
      delete: async ({ name }) => {
        await fetchGitHub(`git/refs/heads/${name}`, 'DELETE')

        return true
      },
      get: async ({ name }) => {
        const { commit, html_url } = await fetchGitHub(`branches/${name}`)

        return {
          message: commit.message,
          name,
          url: html_url
        }
      },
      getExistence: async ({ name }) => {
        try {
          await fetchGitHub(`git/refs/heads/${name}`)
        } catch (message) {
          if (message === 'Not Found') {
            return false
          }

          throw message
        }

        return true
      },
      merge: async ({ base, head }) => {
        const { commit, html_url } = await fetchGitHub('merges', 'POST', {
          base,
          head
        })

        return {
          message: commit.message,
          url: html_url
        }
      }
    },
    commits: {
      compare: async ({ base, head }) => {
        const { commits } = await fetchGitHub(`compare/${base}...${head}`)

        return commits.map(({ commit, html_url }) => ({
          message: commit.message,
          url: html_url
        }))
      },
      getChangelog: async ({ base, head }) => {
        const categoriesLabels = [
          ...config.categories.map(({ label }) => label),
          config.labels.release
        ]
        const matchPRNumber = new RegExp('^.*?\\(#(\\d+)\\)')
        const commits = await github.commits.compare({
          base,
          head
        })

        const pulls = await Promise.all(
          commits.map(({ message }) => matchPRNumber.exec(message))
            .filter((result) => result !== null)
            .map((result) => github.pulls.getChangelog({ number: result[1] }))
        )

        const uncategorizedPulls = pulls.filter(({ labels }) => (
          !categoriesLabels.some((categoryLabel) => (
            labels.includes(categoryLabel)
          ))
        ))

        if (uncategorizedPulls.length === 0) {
          const categories = config.categories.map((category) => ({
            ...category,
            pulls: pulls.filter(({ labels }) => labels.includes(category.label))
          }))
            .filter(({ pulls }) => pulls.length > 0)

          return {
            labels: categories.map(({ label }) => label),
            message: categories.length === 0
              ? 'No new PR'
              : categories.map(({ pulls, title }) => `## ${title}\n${
                pulls.map(({ message }) => message)
                  .join('\n')
              }`)
                .join('\n\n')
          }
        }

        throw `${
          uncategorizedPulls.length === 1
            ? 'This PR is'
            : 'These PRs are'
        } missing a label:\n${
          uncategorizedPulls.map(({ message }) => message)
            .join('\n')
        }`
      }
    },
    pulls: {
      create: async ({ base, head, message, name }) => {
        const {
          isMergeable,
          isMerged,
          number,
          html_url
        } = await fetchGitHub('pulls', 'POST', {
          base,
          body: message,
          head,
          title: name
        })

        return {
          base,
          head,
          isMergeable,
          isMerged,
          message,
          name,
          number,
          url: html_url
        }
      },
      find: async ({ base, head }) => {
        const pulls = await fetchGitHub(
          `pulls?base=${base}&head=${config.owner}:${head}`
        )

        if (pulls.length === 0) {
          return undefined
        }

        return github.pulls.get({
          number: pulls[0].number
        })
      },
      get: async ({ number }) => {
        const {
          base,
          body,
          head,
          html_url,
          isMergeable,
          isMerged,
          name
        } = await fetchGitHub(`pulls/${number}`)

        return {
          base: base.ref,
          head: head.ref,
          isMergeable,
          isMerged,
          message: body,
          name,
          number,
          url: html_url
        }
      },
      getChangelog: async ({ number }) => {
        const { labels, title } = await fetchGitHub(`issues/${number}`)

        return {
          labels: labels.map(({ name }) => name),
          message: `#${number} ${title}`
        }
      },
      merge: async ({ message, method, number }) => {
        await fetchGitHub(`pulls/${number}/merge`, 'PUT', {
          commit_title: message,
          merge_method: method
        })

        return { url: `${baseUrl}pull/${number}` }
      },
      setLabels: async ({ labels, number }) => {
        await fetchGitHub(`issues/${number}/labels`, 'PUT', { labels })

        return { url: `${baseUrl}pull/${number}` }
      },
      update: async ({ message, name, number }) => {
        const {
          base,
          head,
          html_url,
          isMergeable,
          isMerged
        } = await fetchGitHub(`pulls/${number}`, 'PATCH', {
          body: message,
          title: name
        })

        return {
          base: base.ref,
          head: head.ref,
          isMergeable,
          isMerged,
          message,
          name,
          number,
          url: html_url
        }
      }
    },
    releases: {
      create: async ({
        branch,
        isPrerelease = false,
        message,
        name,
        tag
      }) => {
        const { html_url } = await fetchGitHub('releases', 'POST', {
          body: message,
          name,
          prerelease: isPrerelease,
          tag_name: tag,
          target_commitish: branch
        })

        return {
          isPrerelease,
          name,
          tag,
          url: html_url
        }
      },
      getLatest: async ({ isPrerelease = false, isStable = false } = {}) => {
        let release

        if (isStable) {
          release = await fetchGitHub('releases/latest')
        } else {
          const releases = await fetchGitHub('releases')

          if (releases.length === 0) {
            throw 'Not Found'
          }

          if (isPrerelease) {
            const prereleases = releases.filter(({ prerelease }) => prerelease)

            if (prereleases.length === 0) {
              throw 'Not Found'
            }

            release = prereleases[0]
          } else {
            release = releases[0]
          }
        }

        return {
          isPrerelease: release.prerelease,
          name: release.name,
          tag: release.tag_name,
          url: release.html_url
        }
      }
    }
  }

  return github
}

export default GitHub
