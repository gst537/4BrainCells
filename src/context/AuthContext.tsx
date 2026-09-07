'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  token: string | null;
  role: 'viewer' | 'contributor' | 'admin' | null;
  canEdit: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  canEdit: false,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<'viewer' | 'contributor' | 'admin' | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const decodeRole = (jwt: string): 'viewer' | 'contributor' | 'admin' => {
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      return payload.role || 'viewer';
    } catch {
      return 'viewer';
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt');
    if (storedToken) {
      setToken(storedToken);
      setRole(decodeRole(storedToken));
      setIsInitializing(false);
    } else if (pathname !== '/login') {
      router.push('/login');
    } else {
      setIsInitializing(false);
    }
  }, [pathname, router]);

  const login = (newToken: string) => {
    localStorage.setItem('jwt', newToken);
    setToken(newToken);
    setRole(decodeRole(newToken));
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setToken(null);
    setRole(null);
    router.push('/login');
  };

  const canEdit = role === 'contributor' || role === 'admin';

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07080c]">
        <div className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ token, role, canEdit, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
