import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { initializeVersion } from './version-init-core.js'

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')

try {
  const version = initializeVersion(resolve(rootDirectory, 'VERSION'))
  console.info(`Created VERSION ${version}.`)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
