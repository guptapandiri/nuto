import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAccount } from '@/hooks/useAccount';

type AuthMode = 'login' | 'register';

function messageFor(error: unknown): string {
  if (!(error instanceof Error)) return 'Something went wrong. Please try again.';
  if (error.message === 'invalid_credentials') return 'Incorrect email or password.';
  if (error.message === 'account_exists') return 'An account already exists for this email.';
  if (error.message === 'too_many_attempts') return 'Too many attempts. Please try again later.';
  if (error.message === 'validation_failed') return 'Please check the details and try again.';
  return 'Unable to connect. Please try again.';
}

export function AccountDrawer() {
  const { account, isLoading, isDrawerOpen, closeDrawer } = useAccount();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<AuthMode>('login');

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" onClick={closeDrawer} aria-label="Close account" className="absolute inset-0 h-full w-full cursor-default bg-neutral-900/40" />
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Customer account" className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl focus:outline-none">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-lg font-bold">{account ? 'Account details' : mode === 'login' ? 'Log in' : 'Create account'}</h2>
          <button type="button" onClick={closeDrawer} aria-label="Close account" className="grid size-9 place-items-center rounded-full hover:bg-neutral-100">
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {isLoading ? (
            <p className="text-sm text-neutral-500">Loading account…</p>
          ) : account ? (
            <AccountDetails />
          ) : (
            <>
              <div className="grid grid-cols-2 rounded-lg bg-neutral-100 p-1" role="tablist" aria-label="Account access">
                <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => setMode('login')} className={`rounded-md px-3 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-white shadow-sm' : 'text-neutral-500'}`}>Log in</button>
                <button type="button" role="tab" aria-selected={mode === 'register'} onClick={() => setMode('register')} className={`rounded-md px-3 py-2 text-sm font-semibold ${mode === 'register' ? 'bg-white shadow-sm' : 'text-neutral-500'}`}>Create account</button>
              </div>
              {mode === 'login' ? <LoginForm /> : <RegisterForm />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { login } = useAccount();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login({ email, password });
    } catch (reason) {
      setError(messageFor(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <p className="text-sm leading-relaxed text-neutral-500">Log in to view and update your account details.</p>
      <AccountField label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />
      <AccountField label="Password" type="password" autoComplete="current-password" value={password} onChange={setPassword} minLength={8} />
      {error && <p role="alert" className="text-sm text-[#E23744]">{error}</p>}
      <SubmitButton busy={busy}>LOG IN</SubmitButton>
    </form>
  );
}

function RegisterForm() {
  const { register } = useAccount();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register({ name, email, mobile, password });
    } catch (reason) {
      setError(messageFor(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <AccountField label="Full name" autoComplete="name" value={name} onChange={setName} minLength={2} />
      <AccountField label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />
      <AccountField label="Mobile number" type="tel" inputMode="numeric" autoComplete="tel" value={mobile} onChange={setMobile} pattern="(?:\+?91)?[6-9][0-9]{9}" />
      <AccountField label="Password" type="password" autoComplete="new-password" value={password} onChange={setPassword} minLength={8} hint="Use at least 8 characters." />
      {error && <p role="alert" className="text-sm text-[#E23744]">{error}</p>}
      <SubmitButton busy={busy}>CREATE ACCOUNT</SubmitButton>
    </form>
  );
}

function AccountDetails() {
  const { account, updateProfile, logout } = useAccount();
  const [name, setName] = useState(account?.name ?? '');
  const [mobile, setMobile] = useState(account?.mobile ?? '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  if (!account) return null;

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await updateProfile({ name, mobile });
      setMessage('Account details updated.');
    } catch (reason) {
      setMessage(messageFor(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-3 rounded-xl bg-[#1B7A4B]/7 p-4">
        <span className="grid size-11 place-items-center rounded-full bg-[#1B7A4B] text-lg font-bold text-white">{account.name.charAt(0).toUpperCase()}</span>
        <div className="min-w-0"><p className="font-bold">{account.name}</p><p className="truncate text-sm text-neutral-500">{account.email}</p></div>
      </div>
      <form onSubmit={save} className="space-y-4">
        <AccountField label="Full name" autoComplete="name" value={name} onChange={setName} minLength={2} />
        <AccountField label="Email" type="email" value={account.email} onChange={() => undefined} disabled />
        <AccountField label="Mobile number" type="tel" inputMode="numeric" autoComplete="tel" value={mobile} onChange={setMobile} pattern="(?:\+?91)?[6-9][0-9]{9}" />
        {message && <p role="status" className="text-sm text-neutral-600">{message}</p>}
        <SubmitButton busy={busy}>SAVE DETAILS</SubmitButton>
      </form>
      <button type="button" onClick={() => void logout()} className="mt-6 text-sm font-semibold text-[#E23744] underline underline-offset-4">Log out</button>
    </>
  );
}

function AccountField({ label, hint, onChange, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & { label: string; hint?: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input {...props} required onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-[16px] font-normal outline-none focus:border-[#1B7A4B]" />
      {hint && <span className="mt-1 block text-xs font-normal text-neutral-500">{hint}</span>}
    </label>
  );
}

function SubmitButton({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return <button type="submit" disabled={busy} className="w-full rounded-lg bg-[#1B7A4B] px-4 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60">{busy ? 'PLEASE WAIT…' : children}</button>;
}
