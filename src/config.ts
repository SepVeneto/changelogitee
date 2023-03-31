import { getCurrentGitBranch, getFirstGitCommit, getGitHubRepo, getLastGitTag, isPrerelease } from './git'
import type { ChangelogOptions, ResolvedChangelogOptions } from './types'

export function defineConfig(config: ChangelogOptions) {
  return config
}

const defaultConfig: ChangelogOptions = {
  scopeMap: {},
  types: {
    feat: { title: '🚀 Features' },
    fix: { title: '🐞 Bug Fixes' },
    perf: { title: '🏎 Performance' },
  },
  titles: {
    breakingChanges: '🚨 Breaking Changes',
  },
  contributors: true,
  capitalize: true,
  group: true,
}

export async function resolveConfig(options: ChangelogOptions) {
  const { loadConfig } = await import('c12')
  const config = await loadConfig<ChangelogOptions>({
    name: 'changelogitee',
    defaults: defaultConfig,
    overrides: options,
  }).then(r => r.config || defaultConfig)

  // hack: 流水线上取不到上一次提交的commitId时，from会为true
  const _form = (config.from as unknown) === true ? undefined : config.from
  config.from = _form || await getLastGitTag()
  config.to = config.to || await getCurrentGitBranch()
  config.github = config.github || await getGitHubRepo()
  config.prerelease = config.prerelease ?? isPrerelease(config.to)

  if (config.to === config.from)
    config.from = await getLastGitTag(-1) || await getFirstGitCommit()

  return config as ResolvedChangelogOptions
}
