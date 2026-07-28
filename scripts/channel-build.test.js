import { describe, expect, it } from 'vitest'

import {
  buildArchiveName,
  parseChannelBuildArguments,
} from './channel-build-core.js'
import { buildExactEnvironment, validateChannel } from './exact-env.js'

describe('channel validation', () => {
  it.each(['dev', 'stage', 'prod'])('accepts %s', (channel) => {
    expect(validateChannel(channel)).toBe(channel)
  })

  it.each([undefined, 'local', 'production'])('rejects %s', (channel) => {
    expect(() => validateChannel(channel)).toThrow(
      'Expected channel: dev, stage, or prod.',
    )
  })
})

describe('exact environment isolation', () => {
  it('drops stale VITE variables and loads only the selected file', () => {
    const environment = buildExactEnvironment(
      'stage',
      {
        PATH: '/bin',
        VITE_API_BASE_URL: 'https://stale.example',
        VITE_STALE: 'leak',
      },
      process.cwd(),
    )

    expect(environment).toMatchObject({
      PATH: '/bin',
      TRIO_EXACT_ENV_FILE: 'true',
      VITE_API_BASE_URL: 'https://stage.api.trio.am',
      VITE_X_ORIGIN: 'stage.admin.trio.am',
    })
    expect(environment).not.toHaveProperty('VITE_STALE')
  })
})

describe('channel build arguments', () => {
  it('consumes --zip and forwards other Vite arguments', () => {
    expect(
      parseChannelBuildArguments(['dev', '--zip', '--minify=false']),
    ).toEqual({
      channel: 'dev',
      createZip: true,
      viteArguments: ['--minify=false'],
    })
  })

  it('does not package by default', () => {
    expect(parseChannelBuildArguments(['prod'])).toEqual({
      channel: 'prod',
      createZip: false,
      viteArguments: [],
    })
  })

  it.each([
    ['dev', '--mode', 'prod'],
    ['stage', '--mode=prod'],
  ])('rejects a conflicting mode in %s', (...arguments_) => {
    expect(() => parseChannelBuildArguments(arguments_)).toThrow(
      'Channel builds set the Vite mode automatically.',
    )
  })
})

describe('archive naming', () => {
  it('uses VERSION, project name, and channel', () => {
    expect(buildArchiveName('2026.07.8', 'trio_superadmin', 'dev')).toBe(
      '2026.07.8_trio_superadmin_dev.zip',
    )
  })
})
