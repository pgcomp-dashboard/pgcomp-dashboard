import React, { createContext, useEffect, useState } from 'react';
import api from '@/services/api';

const AUTH_TOKEN_STORAGE_KEY = 'auth-token';

export interface AuthContextType {
  isLoading: boolean,
  isAuthenticated: boolean,
  login(token: string): void,
  logout(): void,
}

export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ token, setToken ] = useState<string | undefined>(undefined);

  // Load the initial token
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (storedToken) {
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  // Run every time that the token updates
  useEffect(() => {
    api.setAuthToken(token);
    if (token) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  }, [ token ]);

  function login(token: string) {
    setToken(token);
  }

  function logout() {
    setToken(undefined);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, login, logout, isLoading: loading }}>
      {children}
    </AuthContext.Provider>
  );
};
