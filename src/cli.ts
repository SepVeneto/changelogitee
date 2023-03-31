#!/usr/bin/env node
import { blue, bold, cyan, dim, red, yellow } from 'kolorist'
import cac from 'cac'
import { version } from '../package.json'
import { generate, isRepoShallow, sendRelease } from './index'

const cli = cac('changelogitee')

cli
  .version(version)
  .option('-n, --notify <url>', 'webhook notification')
  .option('-t, --token <path>', 'Gitee Token')
  .option('--from [ref]', 'From tag, default is the latest tag')
  .option('--to <ref>', 'To tag')
  // .option('--github <path>', 'GitHub Repository, e.g. antfu/changelogithub')
  .option('--name <name>', 'Name of the release')
  .option('--contributors', 'Show contributors section')
  .option('--prerelease', 'Mark release as prerelease')
  .option('-d, --draft', 'Mark release as draft')
  .option('--capitalize', 'Should capitalize for each comment message')
  .option('--emoji', 'Use emojis in section titles', { default: true })
  .option('--group', 'Nest commit messages under their scopes')
  .option('--dry', 'Dry run')
  .help()

cli
  .command('')
  .action(async (args) => {
    args.token = args.token || process.env.GITHUB_TOKEN

    try {
      console.log()
      console.log(dim(`changelo${bold('gitee')} `) + dim(`v${version}`))

      const { config, md, commits } = await generate(args as any)

      console.log(cyan(config.from) + dim(' -> ') + blue(config.to) + dim(` (${commits.length} commits)`))
      console.log(dim('--------------'))
      console.log()
      console.log(md.replace(/\&nbsp;/g, ''))
      console.log()
      console.log(dim('--------------'))

      if (config.dry) {
        console.log(yellow('Dry run. Release skipped.'))
        return
      }

      await sendRelease(config, md.replace(/\&nbsp;/g, ''), args.notify)

      if (!commits.length && await isRepoShallow()) {
        console.error(yellow('The repo seems to be clone shallowly, which make changelog failed to generate. You might want to specify `fetch-depth: 0` in your CI config.'))
        process.exitCode = 1
        return
      }
    }
    catch (e: any) {
      console.error(red(String(e)))
      if (e?.stack)
        console.error(dim(e.stack?.split('\n').slice(1).join('\n')))
      process.exit(1)
    }
  })

cli.parse()
