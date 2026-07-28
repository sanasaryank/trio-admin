import { existsSync, writeFileSync } from 'node:fs'

export function buildInitialVersion(now = new Date()) {
  const year = String(now.getUTCFullYear())
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  return `${year}.${month}.1`
}

export function initializeVersion(versionPath, now = new Date()) {
  if (existsSync(versionPath)) {
    throw new Error('VERSION already exists; refusing to overwrite it.')
  }

  const version = buildInitialVersion(now)
  writeFileSync(versionPath, `${version}\n`, { flag: 'wx' })
  return version
}
