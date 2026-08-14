import { createContext } from 'react';

export interface CustomerAccount {
  id: string;
  email: string;
  name: string;
  mobile: string;
}

export interface LoginDetails {
  email: string;
  password: string;
}

export interface RegistrationDetails extends LoginDetails {
  name: string;
  mobile: string;
}

export interface AccountContextValue {
  account: CustomerAccount | null;
  isLoading: boolean;
  isDrawerOpen: boolean;
  drawerSection: 'details' | 'orders' | 'tracking';
  openDrawer: () => void;
  openOrders: () => void;
  openTracking: () => void;
  closeDrawer: () => void;
  login: (details: LoginDetails) => Promise<void>;
  register: (details: RegistrationDetails) => Promise<void>;
  updateProfile: (details: Pick<CustomerAccount, 'name' | 'mobile'>) => Promise<void>;
  logout: () => Promise<void>;
}

export const AccountContext = createContext<AccountContextValue | undefined>(undefined);
