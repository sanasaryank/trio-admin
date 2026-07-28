import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import { buildExactEnvironment, validateChannel } from './exact-env.js'

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const channel = validateChannel(process.argv[2])
const child = Bun.spawn(
  ['bunx', 'vite', '--host', '0.0.0.0', '--mode', channel],
  {
    cwd: rootDirectory,
    env: buildExactEnvironment(channel, process.env, rootDirectory),
    stderr: 'inherit',
    stdout: 'inherit',
  },
)
process.exit(await child.exited)
