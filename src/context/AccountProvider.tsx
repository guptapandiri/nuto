import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiUrl } from '@/lib/api';
import {
  AccountContext,
  type AccountContextValue,
  type CustomerAccount,
  type LoginDetails,
  type RegistrationDetails,
} from './account-context';

async function accountRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) throw new Error(payload.error ?? 'request_failed');
  return payload;
}

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<CustomerAccount | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [drawerSection, setDrawerSection] = useState<'details' | 'orders' | 'tracking'>('details');

  useEffect(() => {
    let active = true;
    accountRequest<CustomerAccount>('/api/account/me')
      .then((user) => {
        if (active) setAccount(user);
      })
      .catch(() => {
        if (active) setAccount(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (details: LoginDetails) => {
    const user = await accountRequest<CustomerAccount>('/api/account/login', {
      method: 'POST',
      body: JSON.stringify(details),
    });
    setAccount(user);
  }, []);

  const register = useCallback(async (details: RegistrationDetails) => {
    const user = await accountRequest<CustomerAccount>('/api/account/register', {
      method: 'POST',
      body: JSON.stringify(details),
    });
    setAccount(user);
  }, []);

  const updateProfile = useCallback(
    async (details: Pick<CustomerAccount, 'name' | 'mobile'>) => {
      const user = await accountRequest<CustomerAccount>('/api/account/me', {
        method: 'PATCH',
        body: JSON.stringify(details),
      });
      setAccount(user);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await accountRequest<{ ok: boolean }>('/api/account/logout', { method: 'POST' });
    } catch {
      // A stale or unreachable session should not trap the shopper in signed-in UI.
    } finally {
      setAccount(null);
    }
  }, []);

  const openDrawer = useCallback(() => {
    setDrawerSection('details');
    setDrawerOpen(true);
  }, []);
  const openOrders = useCallback(() => {
    setDrawerSection('orders');
    setDrawerOpen(true);
  }, []);
  const openTracking = useCallback(() => {
    setDrawerSection('tracking');
    setDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<AccountContextValue>(
    () => ({
      account,
      isLoading,
      isDrawerOpen,
      drawerSection,
      openDrawer,
      openOrders,
      openTracking,
      closeDrawer,
      login,
      register,
      updateProfile,
      logout,
    }),
    [account, isLoading, isDrawerOpen, drawerSection, openDrawer, openOrders, openTracking, closeDrawer, login, register, updateProfile, logout],
  );

  return <AccountContext value={value}>{children}</AccountContext>;
}
