import { User } from '@/types/auth';

const STORAGE_KEY = 'timenode_auth';

export const authStorage = {
  getUser: (): User | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },

  removeUser: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },
};

// Mock authentication functions
export const authAPI = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock users for demo
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@timenode.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'John Employee',
        email: 'employee@timenode.com',
        role: 'employee',
        createdAt: new Date().toISOString(),
      },
    ];

    const user = mockUsers.find(u => u.email === email);
    if (!user || password !== 'password123') {
      throw new Error('Invalid credentials');
    }

    return user;
  },

  register: async (data: any): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      role: data.role,
      createdAt: new Date().toISOString(),
    };

    return newUser;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Mock success
  },

  resetPassword: async (data: any): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Mock success
  },
};