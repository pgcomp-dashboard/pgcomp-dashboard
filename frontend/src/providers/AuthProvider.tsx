import { apiClient } from '@/services/http-client';
import React, { createContext, useEffect, useState } from 'react';

const AUTH_TOKEN_STORAGE_KEY = 'auth-token';
const USER_INFO_STORAGE_KEY = 'user-info';

export interface User {
  name: string,
  role: string,
}

export interface AuthContextType {
  user: User | undefined,
  isLoading: boolean,
  isAuthenticated: boolean,
  isAdmin: boolean,
  login(token: string, userData: User): void,
  logout(): void,
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthContext = createContext<AuthContextType>({
//     user: undefined,
//     profile: "basic",
//     isLoading: true,
//     isAuthenticated: false,
//     login: () => {},
//     logout: () => {},
//     changeProfile: () => {}
// });

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ token, setToken ] = useState<string | undefined>(undefined);
  const [ user, setUser ] = useState<User | undefined>(undefined);

  // Load the initial infos
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const userInfo = localStorage.getItem(USER_INFO_STORAGE_KEY);

    if (storedToken) {
      setToken(storedToken);
    }

    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }

    setLoading(false);
  }, []);

  // Run every time that the token updates
  useEffect(() => {
    apiClient.setAuthToken(token);
    if (token) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      if (user) {
        localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(user));
      }
    } else {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_INFO_STORAGE_KEY);
    }
  }, [ token ]);

  function login(token: string, userData: User) {
    setToken(token);
    setUser(userData);
  }

  function logout() {
    setToken(undefined);
    setUser(undefined);
  }

  const contextValue: AuthContextType = {
    user,
    isLoading: loading,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
