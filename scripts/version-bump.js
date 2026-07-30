import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const pattern = /^(\d{4})\.(0[1-9]|1[0-2])\.([1-9]\d*)$/u
const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const versionPath = resolve(rootDirectory, 'VERSION')
const currentVersion = readFileSync(versionPath, 'utf8').trim()
const match = pattern.exec(currentVersion)

if (!match) {
  console.error(`Invalid VERSION: ${currentVersion}`)
  process.exit(1)
}

const now = new Date()
const year = String(now.getUTCFullYear())
const month = String(now.getUTCMonth() + 1).padStart(2, '0')
const sequence =
  match[1] === year && match[2] === month ? Number(match[3]) + 1 : 1
const nextVersion = `${year}.${month}.${sequence}`

writeFileSync(versionPath, `${nextVersion}\n`)
console.info(`Bumped VERSION from ${currentVersion} to ${nextVersion}.`)
