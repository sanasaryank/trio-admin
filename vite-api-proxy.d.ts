export interface ApiProxyRoute {
  target: string
  rewrite(path: string): string
}

export function createApiProxyRoute(apiProxyTarget: string): ApiProxyRoute
