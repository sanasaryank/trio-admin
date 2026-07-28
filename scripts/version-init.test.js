import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  buildInitialVersion,
  initializeVersion,
} from './version-init-core.js'

describe('version initialization', () => {
  it('uses the current UTC year and month with sequence 1', () => {
    expect(buildInitialVersion(new Date('2027-01-31T23:00:00-02:00'))).toBe(
      '2027.02.1',
    )
  })

  it('creates a missing VERSION file', () => {
    const directory = mkdtempSync(resolve(tmpdir(), 'trio-admin-version-'))
    const versionPath = resolve(directory, 'VERSION')

    expect(
      initializeVersion(versionPath, new Date('2026-07-28T12:00:00Z')),
    ).toBe('2026.07.1')
    expect(readFileSync(versionPath, 'utf8')).toBe('2026.07.1\n')
  })

  it('refuses to overwrite an existing VERSION file', () => {
    const directory = mkdtempSync(resolve(tmpdir(), 'trio-admin-version-'))
    const versionPath = resolve(directory, 'VERSION')
    initializeVersion(versionPath, new Date('2026-07-28T12:00:00Z'))

    expect(() => initializeVersion(versionPath)).toThrow(
      'VERSION already exists; refusing to overwrite it.',
    )
  })
})
