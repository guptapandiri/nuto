import { useContext } from 'react';
import { AccountContext, type AccountContextValue } from '@/context/account-context';

export function useAccount(): AccountContextValue {
  const context = useContext(AccountContext);
  if (!context) throw new Error('useAccount must be used inside <AccountProvider>.');
  return context;
}
