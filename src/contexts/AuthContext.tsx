import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Auth } from 'aws-amplify';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const user = await Auth.signIn(email, password);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function signUp(email: string, password: string) {
    try {
      const { user } = await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
        },
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function confirmSignUp(email: string, code: string) {
    try {
      return await Auth.confirmSignUp(email, code);
    } catch (error) {
      throw error;
    }
  }

  async function signOut() {
    try {
      await Auth.signOut();
      setUser(null);
    } catch (error) {
      throw error;
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    confirmSignUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
