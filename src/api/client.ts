/**
 * API Client Configuration
 * Base configuration for HTTP requests
 */

import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * API configuration object
 */
export const apiConfig = {
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * Create full API URL from endpoint
 */
export const createApiUrl = (endpoint: string): string => {
  const baseUrl = apiConfig.baseURL.endsWith('/') 
    ? apiConfig.baseURL.slice(0, -1) 
    : apiConfig.baseURL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Get authorization header
 */
export const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Create fetch options with default configuration
 */
export const createFetchOptions = (
  method: string,
  body?: unknown,
): RequestInit => {
  const options: RequestInit = {
    method,
    headers: {
      ...apiConfig.headers,
      ...getAuthHeader(),
    },
    signal: AbortSignal.timeout(apiConfig.timeout),
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
};

/**
 * API request wrapper with error handling
 */
export const apiRequest = async <T>(
  endpoint: string,
  method: string,
  body?: unknown,
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const url = createApiUrl(endpoint);
    const options = createFetchOptions(method, body);
    
    logger.debug(`API ${method} ${endpoint}`, body);

    const response = await fetch(url, options);
    const duration = performance.now() - startTime;

    logger.api(method, endpoint, response.status, duration);

    if (!response.ok) {
      const error = new Error(`API Error: ${response.status} ${response.statusText}`);
      logger.error(`API request failed: ${method} ${endpoint}`, error, {
        status: response.status,
        statusText: response.statusText,
      });
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.api(method, endpoint, undefined, duration);
    logger.error(`API request exception: ${method} ${endpoint}`, error);
    throw error;
  }
};

/**
 * HTTP Methods
 */
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, 'GET'),
  post: <T>(endpoint: string, body: unknown) => apiRequest<T>(endpoint, 'POST', body),
  put: <T>(endpoint: string, body: unknown) => apiRequest<T>(endpoint, 'PUT', body),
  patch: <T>(endpoint: string, body: unknown) => apiRequest<T>(endpoint, 'PATCH', body),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, 'DELETE'),
};

export default api;
