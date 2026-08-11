import { useState } from 'react';
import { api, ApiError, type AdminUser } from './api';

export function LoginPage({ onSignedIn }: { onSignedIn: (user: AdminUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await api.post<AdminUser>('/admin/login', { email, password });
      onSignedIn(user);
    } catch (err) {
      // The server does not say whether it was the email or the password, and
      // neither does this.
      setError(
        err instanceof ApiError && err.code === 'too_many_attempts'
          ? 'Too many attempts. Try again in a few minutes.'
          : 'Incorrect email or password.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-neutral-100 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
      >
        <img src="/nuto-wordmark.svg" alt="Nuto" className="h-7 w-auto" />
        <h1 className="mt-6 text-lg font-bold">Admin sign in</h1>
        <p className="mt-1 text-[13px] text-neutral-500">
          Order management and inventory.
        </p>

        <label className="mt-6 block text-[13px] font-medium">
          Email
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-[16px] focus:border-[#1B7A4B] focus:outline-none sm:text-[14px]"
          />
        </label>

        <label className="mt-4 block text-[13px] font-medium">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-[16px] focus:border-[#1B7A4B] focus:outline-none sm:text-[14px]"
          />
        </label>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-lg bg-[#1B7A4B] py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#12351F] disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
