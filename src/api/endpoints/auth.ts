import { mockAuthApi } from '../mock';
import type { LoginRequest, LoginResponse, User } from '../../types';

export const authApi = {
  login: (credentials: LoginRequest): Promise<LoginResponse> => {
    return mockAuthApi.login(credentials);
  },

  me: (): Promise<User> => {
    return mockAuthApi.me();
  },

  logout: (): Promise<void> => {
    return mockAuthApi.logout();
  },
};
