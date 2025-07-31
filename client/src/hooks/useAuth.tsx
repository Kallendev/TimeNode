import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, AuthState } from '@/types/auth';
import { authStorage, authAPI } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const user = authStorage.getUser();
    setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const user = await authAPI.login(email, password);
      authStorage.setUser(user);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.name}`,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const user = await authAPI.register(data);
      authStorage.setUser(user);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      toast({
        title: 'Account created!',
        description: `Welcome to TimeNode, ${user.name}`,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    authStorage.removeUser();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast({
      title: 'Logged out',
      description: 'See you next time!',
    });
  };

  const forgotPassword = async (email: string) => {
    try {
      await authAPI.forgotPassword(email);
      toast({
        title: 'Reset link sent',
        description: 'Check your email for password reset instructions',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reset link',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const resetPassword = async (data: any) => {
    try {
      await authAPI.resetPassword(data);
      toast({
        title: 'Password reset',
        description: 'Your password has been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset password',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};