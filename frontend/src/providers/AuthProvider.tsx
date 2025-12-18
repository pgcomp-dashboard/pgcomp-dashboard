import api from '@/services/api';
import React, { createContext, useEffect, useState } from 'react';

const AUTH_TOKEN_STORAGE_KEY = 'auth-token';

export interface User {
  name: string,
  roles: string[]
}

export interface AuthContextType {
  user: User | undefined,
  profile: string,
  isLoading: boolean,
  isAuthenticated: boolean,
  login(token: string, userData: User): void,
  logout(): void,
  changeProfile(role: string): void
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
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [profile, setProfile] = useState<string>("basic")

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

  function login(token: string, userData: User) {
    setToken(token);
    setUser(userData);
  }

  function logout() {
    setToken(undefined);
    setUser(undefined);
    setProfile("")
  }

  function changeProfile(role: string){
    setProfile(role)
  }

  const contextValue: AuthContextType = {
    user,
    profile,
    isLoading: loading,
    isAuthenticated: !!token,
    login,
    logout,
    changeProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
