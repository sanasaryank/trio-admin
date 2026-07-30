export function createApiProxyRoute(apiProxyTarget) {
  const targetUrl = new globalThis.URL(apiProxyTarget)

  return {
    target: targetUrl.origin,
    rewrite(path) {
      return path.replace(/^\/api(?=\/|$)/u, '') || '/'
    },
  }
}
