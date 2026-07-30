import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const channels = ['dev', 'stage', 'prod']

export function validateChannel(channel) {
  if (!channels.includes(channel)) {
    throw new Error('Expected channel: dev, stage, or prod.')
  }

  return channel
}

export function parseEnv(contents) {
  const values = {}

  for (const line of contents.split(/\r?\n/u)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separator = trimmed.indexOf('=')
    if (separator < 1) {
      throw new Error(`Invalid environment line: ${line}`)
    }

    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    values[key] = value
  }

  return values
}

export function buildExactEnvironment(
  channel,
  source = process.env,
  rootDirectory = process.cwd(),
) {
  validateChannel(channel)
  const environment = Object.fromEntries(
    Object.entries(source).filter(([key]) => !key.startsWith('VITE_')),
  )
  const file = resolve(rootDirectory, `.env.${channel}`)

  return {
    ...environment,
    ...parseEnv(readFileSync(file, 'utf8')),
    TRIO_EXACT_ENV_FILE: 'true',
  }
}
