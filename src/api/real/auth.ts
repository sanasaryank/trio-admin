import type { LoginRequest, LoginResponse, User } from '../../types';
import { realApiFetch } from './client';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

const AUTH_BASE_URL = `${env.apiBaseUrl}/admin/auth`;

export const realAuthApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // Create Basic Auth header
    const basicAuth = btoa(`${credentials.username}:${credentials.password}`);
    
    // Don't use realApiFetch for login since it doesn't need Bearer token
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data: LoginResponse = await response.json();
    
    // Store token in localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('tokenExpires', data.expires);
    
    // Store user session
    const user: User = {
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
    };
    localStorage.setItem('userSession', JSON.stringify(user));

    return data;
  },

  me: async (): Promise<User> => {
    // First check if we have a stored session
    const storedSession = localStorage.getItem('userSession');
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    // If we have stored session, return it (backend /me might not be implemented yet)
    if (storedSession) {
      try {
        return JSON.parse(storedSession);
      } catch (error) {
        logger.error('Failed to parse stored session', error as Error);
      }
    }

    // Try to fetch from backend (may not be implemented)
    try {
      const response = await realApiFetch(`${AUTH_BASE_URL}/me`, {
        method: 'GET',
      });

      if (response.ok) {
        const data: User = await response.json();
        return data;
      }
    } catch (error) {
      logger.warn('/me endpoint not available, using stored session');
    }

    // If backend call fails but we have token, throw error
    throw new Error('Not authenticated');
  },

  logout: async (): Promise<void> => {
    // Clear local storage - this is all we need for logout
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpires');
    localStorage.removeItem('userSession');
    
    // Note: Backend /logout endpoint returns 500, so we skip the server call
    // Token will expire naturally on the server side
  },
};
