import api from '@/services/api';
import React, { createContext, useEffect, useState } from 'react';

const AUTH_TOKEN_STORAGE_KEY = 'auth-token';
const USER_INFO_STORAGE_KEY = 'user-info';
const ACTIVE_PROFILE_STORAGE_KEY = 'current-profile'

export interface User {
  name: string,
  roles: string[]
}

export interface AuthContextType {
  user: User | undefined,
  activeProfile: string | undefined,
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
  const [activeProfile, setActiveProfile] = useState<string | undefined>(undefined)

  // Load the initial infos
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const userInfo = localStorage.getItem(USER_INFO_STORAGE_KEY);
    const profile = localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY)

    if (storedToken) {
      setToken(storedToken);
    }

    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }

    if (profile) {
      setActiveProfile(profile)
    }

    setLoading(false);
  }, []);

  // Run every time that the token updates
  useEffect(() => {
    api.setAuthToken(token);
    if (token) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      if (user) {
        localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(user));
      }
      if (activeProfile) {
        localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, activeProfile);
      }
    } else {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_INFO_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY);

    }
  }, [token]);

  //Run when profile change
  useEffect(() => {
    if (activeProfile) {
      localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, activeProfile)
    }

  }, [activeProfile])

  function login(token: string, userData: User) {
    setToken(token);
    setUser(userData);
  }

  function logout() {
    setToken(undefined);
    setUser(undefined);
    setActiveProfile("basic")
  }

  function changeProfile(role: string){
    setActiveProfile(role)
  }

  const contextValue: AuthContextType = {
    user,
    activeProfile,
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
