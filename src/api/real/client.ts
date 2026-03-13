/**
 * Real API Client with authentication and error handling
 */

import { parseApiError, ApiError } from '../errors';

const getAuthHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
  };
};

const handleUnauthorized = () => {
  // Redirect to login - cookie will be cleared by server
  const loginUrl = `${import.meta.env.BASE_URL}login`;
  window.location.href = loginUrl;
};

const getRequestHeaders = (overrides?: HeadersInit): HeadersInit => {
  const merged: Record<string, string> = {
    ...(getAuthHeaders() as Record<string, string>),
    ...(import.meta.env.DEV ? { 'X-Origin': 'admin.trio.am' } : {}),
  };
  if (overrides) {
    if (overrides instanceof Headers) {
      overrides.forEach((value, key) => {
        merged[key] = value;
      });
    } else if (Array.isArray(overrides)) {
      for (const [key, value] of overrides) merged[key] = value;
    } else {
      Object.assign(merged, overrides);
    }
  }
  return merged;
};

export const realApiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Important: include cookies in all requests
    headers: getRequestHeaders(options.headers),
  });

  // Handle 401 Unauthorized - redirect to login
  if (response.status === 401) {
    handleUnauthorized();
    throw new ApiError(401, 0, 'Unauthorized');
  }

  // Handle other error status codes
  if (!response.ok) {
    const apiError = await parseApiError(response);
    throw apiError;
  }

  return response;
};

export { getAuthHeaders };
