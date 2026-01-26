import type { LoginRequest, LoginResponse, User } from '../../types';
import { realApiFetch } from './client';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

const AUTH_BASE_URL = `${env.apiBaseUrl}/admin/auth`;

export const realAuthApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // Create Basic Auth header
    const basicAuth = btoa(`${credentials.username}:${credentials.password}`);
    
    // Server will set HttpOnly cookie named "admin_token"
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: include cookies in request
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data: LoginResponse = await response.json();
    // No need to store anything - cookie is managed by browser
    return data;
  },

  me: async (): Promise<User> => {
    // Fetch current user from backend using cookie authentication
    try {
      const response = await realApiFetch(`${AUTH_BASE_URL}/me`, {
        method: 'GET',
      });

      if (response.ok) {
        const data: User = await response.json();
        return data;
      }
    } catch (error) {
      logger.warn('Failed to fetch user info', error as Error);
    }

    throw new Error('Not authenticated');
  },

  logout: async (): Promise<void> => {
    // Call server to clear the HttpOnly cookie
    try {
      await realApiFetch(`${AUTH_BASE_URL}/logout`, {
        method: 'POST',
      });
    } catch (error) {
      // Even if logout fails, we continue since cookie might be cleared
      logger.warn('Logout request failed', error as Error);
    }
  },
};
