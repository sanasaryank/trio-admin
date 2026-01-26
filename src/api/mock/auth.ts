import { getDatabase, getSession, saveSession, clearSession } from './storage';
import { addAuditEvent } from './audit';
import type { LoginRequest, LoginResponse, User } from '../../types';

export const mockAuthApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const db = getDatabase();
    const user = db.users.find(
      (u) => u.username === credentials.username && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const userResponse: User = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    saveSession(userResponse);

    // Log audit event
    addAuditEvent({
      actorId: user.id,
      actorName: `${user.firstName} ${user.lastName}`,
      action: 'login',
      entityType: 'user',
      entityId: user.id,
      entityLabel: user.username,
    });

    return { user: userResponse };
  },

  me: async (): Promise<User> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const session = getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    return session;
  },

  logout: async (): Promise<void> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const session = getSession();
    if (session) {
      // Log audit event
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: 'logout',
        entityType: 'user',
        entityId: session.id,
        entityLabel: session.username,
      });
    }

    clearSession();
  },
};
