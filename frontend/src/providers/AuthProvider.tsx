import { useUser } from "@/hooks/use-user";
import { queryClient } from "@/lib/query-client";
import { apiClient } from "@/services/http-client";
import { normalizeUser } from "@/utils/auth-utils";
import React, { createContext, useEffect, useState } from "react";

const AUTH_TOKEN_STORAGE_KEY = "auth-token";
const USER_INFO_STORAGE_KEY = "user-info";

export interface User {
  name: string;
  role: string;
  is_approved: boolean;
  type?: string;
}

export interface AuthContextType {
  user: User | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  login(token: string, userData: User): void;
  logout(): void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [token, setToken] = useState<string | undefined>(() => {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || undefined;
  });
  const { data: user, isLoading, error } = useUser(!!token);

  // Load the initial infos
  useEffect(() => {
    if (token) {
      apiClient.setAuthToken(token);
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } else {
      apiClient.setAuthToken(undefined);
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_INFO_STORAGE_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error]);

  function login(newToken: string, userData: User) {
    const cleanUser = normalizeUser(userData);

    apiClient.setAuthToken(newToken);

    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, newToken);
    localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(cleanUser));

    setToken(newToken);
  }

  function logout() {
    setToken(undefined);
    queryClient.clear();
  }

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === "admin",
    isManager: user?.role === "admin" || user?.role === "manager" || user?.type === "manager",
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
