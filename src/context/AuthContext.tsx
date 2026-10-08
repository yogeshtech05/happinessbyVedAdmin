"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AdminUser } from "@/types";
import { apiRequest } from "@/services/apiService";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (code: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchCurrentUser = async () => {
    try {
      const res = await apiRequest<AdminUser>("/api/auth/me");
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const res = await apiRequest<AdminUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      setUser(res.data);
      setLoading(false);
      return { success: true };
    } else {
      setLoading(false);
      return { success: false, error: res.error || "Invalid email or password" };
    }
  };

  const logout = async () => {
    setLoading(true);
    await apiRequest("/api/auth/logout", { method: "POST" });
    setUser(null);
    setLoading(false);
    router.push("/login");
  };

  const hasPermissionCheck = (code: string): boolean => {
    if (!user) return false;
    if (user.roleName === "Super Admin") return true;
    return user.permissions?.includes(code) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        hasPermission: hasPermissionCheck,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
