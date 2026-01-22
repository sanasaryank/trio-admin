/**
 * Real API Client with authentication and error handling
 */

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const handleUnauthorized = () => {
  // Clear auth data
  localStorage.removeItem('authToken');
  localStorage.removeItem('tokenExpires');
  localStorage.removeItem('userSession');
  
  // Redirect to login
  window.location.href = '/login';
};

export const realApiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const response = await fetch(url, {
    ...options,
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
