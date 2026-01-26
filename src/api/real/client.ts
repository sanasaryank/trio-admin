/**
 * Real API Client with authentication and error handling
 */

const getAuthHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
  };
};

const handleUnauthorized = () => {
  // Redirect to login - cookie will be cleared by server
  window.location.href = '/login';
};

export const realApiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Important: include cookies in all requests
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthorized');
  }

  return response;
};

export { getAuthHeaders };
