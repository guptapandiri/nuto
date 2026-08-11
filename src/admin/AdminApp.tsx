import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, type AdminUser } from './api';
import { AdminShell } from './AdminShell';
import { LoginPage } from './LoginPage';

type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; user: AdminUser };

/**
 * Owns the admin session. Everything under /admin is gated on this — but the
 * gate is cosmetic: the server rejects unauthenticated API calls regardless,
 * so a user who fakes their way past this UI sees nothing.
 */
export function AdminApp() {
  const [auth, setAuth] = useState<AuthState>({ status: 'loading' });

  const check = useCallback(async () => {
    try {
      const user = await api.get<AdminUser>('/admin/me');
      setAuth({ status: 'signed-in', user });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setAuth({ status: 'signed-out' });
      } else {
        setAuth({ status: 'signed-out' });
      }
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  if (auth.status === 'loading') {
    return (
      <div className="grid min-h-dvh place-items-center bg-neutral-100 text-sm text-neutral-500">
        Loading…
      </div>
    );
  }

  if (auth.status === 'signed-out') {
    return <LoginPage onSignedIn={(user) => setAuth({ status: 'signed-in', user })} />;
  }

  return (
    <AdminShell
      user={auth.user}
      onSignOut={async () => {
        await api.post('/admin/logout').catch(() => undefined);
        setAuth({ status: 'signed-out' });
      }}
    />
  );
}
