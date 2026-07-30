import { describe, expect, it } from 'vitest'

import { createApiProxyRoute } from './vite-api-proxy.js'

describe('local API proxy', () => {
  it('does not add an upstream /api suffix and strips the local prefix', () => {
    const route = createApiProxyRoute('https://dev.api.trio.am')

    expect(route.target).toBe('https://dev.api.trio.am')
    expect(route.rewrite('/api/restaurants')).toBe('/restaurants')
    expect(route.rewrite('/api')).toBe('/')
  })
})
