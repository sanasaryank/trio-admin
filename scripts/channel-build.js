import { existsSync, readFileSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  buildArchiveName,
  parseChannelBuildArguments,
} from './channel-build-core.js'
import { buildExactEnvironment } from './exact-env.js'

async function run(command, arguments_, options = {}) {
  const child = Bun.spawn([command, ...arguments_], {
    stderr: 'inherit',
    stdout: 'inherit',
    ...options,
  })
  const exitCode = await child.exited
  if (exitCode !== 0) {
    throw new Error(`${command} exited with code ${exitCode}.`)
  }
}

async function main() {
  const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const { channel, createZip, viteArguments } = parseChannelBuildArguments(
    process.argv.slice(2),
  )
  const environment = buildExactEnvironment(
    channel,
    process.env,
    rootDirectory,
  )

  await run(
    'bunx',
    ['vite', 'build', '--mode', channel, ...viteArguments],
    { cwd: rootDirectory, env: environment },
  )

  if (!createZip) return

  const distDirectory = resolve(rootDirectory, 'dist')
  if (!existsSync(distDirectory)) {
    throw new Error('dist/ was not created by the build.')
  }

  const version = readFileSync(resolve(rootDirectory, 'VERSION'), 'utf8').trim()
  const { name } = JSON.parse(
    readFileSync(resolve(rootDirectory, 'package.json'), 'utf8'),
  )
  const archiveName = buildArchiveName(version, name, channel)
  const archivePath = resolve(rootDirectory, archiveName)
  rmSync(archivePath, { force: true })
  await run('zip', ['-q', '-r', archivePath, '.'], { cwd: distDirectory })
  console.info(`Created ${archiveName}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
