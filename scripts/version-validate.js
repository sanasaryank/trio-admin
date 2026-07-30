import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const versionPattern = /^\d{4}\.(0[1-9]|1[0-2])\.[1-9]\d*$/u

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const version = readFileSync(resolve(rootDirectory, 'VERSION'), 'utf8').trim()

if (!versionPattern.test(version)) {
  console.error(`Invalid VERSION: ${version}`)
  console.error('Expected format: YYYY.MM.N')
  process.exit(1)
}

console.info(`VERSION ${version} is valid.`)
