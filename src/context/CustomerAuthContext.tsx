'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  hasPassword?: boolean;
  address?: {
    street?: string;
    city?: string;
    zip?: string;
    country?: string;
  } | null;
  orders?: any[];
  spent?: number;
  orderCount?: number;
}

export type AuthModalTab = 'login' | 'otp' | 'register' | 'forgot';

interface CustomerAuthContextType {
  customer: CustomerProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: AuthModalTab;
  openAuthModal: (tab?: AuthModalTab) => void;
  closeAuthModal: () => void;
  refreshCustomer: () => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  sendLoginOtp: (email: string) => Promise<{ success: boolean; error?: string; devOtp?: string }>;
  verifyLoginOtp: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  sendForgotOtp: (email: string) => Promise<{ success: boolean; error?: string; devOtp?: string }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<AuthModalTab>('login');

  const refreshCustomer = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.loggedIn) {
          setIsLoggedIn(true);
          setCustomer({
            id: data.customerId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            hasPassword: data.hasPassword,
            address: data.address,
            orders: data.orders || [],
            spent: data.spent || 0,
            orderCount: data.orderCount || 0,
          });
          return;
        }
      }
      setIsLoggedIn(false);
      setCustomer(null);
    } catch (e) {
      console.error('Session check error:', e);
      setIsLoggedIn(false);
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCustomer();
  }, [refreshCustomer]);

  const openAuthModal = (tab: AuthModalTab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const loginWithPassword = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshCustomer();
        closeAuthModal();
        return { success: true };
      }
      return { success: false, error: data.error || 'Authentication failed.' };
    } catch (e: any) {
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  const sendLoginOtp = async (email: string) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, devOtp: data.devOtp };
      }
      return { success: false, error: data.error || 'Failed to send verification code.' };
    } catch (e: any) {
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  const verifyLoginOtp = async (email: string, code: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshCustomer();
        closeAuthModal();
        return { success: true };
      }
      return { success: false, error: data.error || 'Verification code failed.' };
    } catch (e: any) {
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  const sendForgotOtp = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, devOtp: data.devOtp };
      }
      return { success: false, error: data.error || 'Failed to send reset code.' };
    } catch (e: any) {
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshCustomer();
        closeAuthModal();
        return { success: true };
      }
      return { success: false, error: data.error || 'Password reset failed.' };
    } catch (e: any) {
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshCustomer();
        closeAuthModal();
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed.' };
    } catch (e: any) {
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLoggedIn(false);
      setCustomer(null);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoggedIn,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        refreshCustomer,
        loginWithPassword,
        sendLoginOtp,
        verifyLoginOtp,
        sendForgotOtp,
        resetPassword,
        register,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
