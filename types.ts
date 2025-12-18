
export type TransactionType = 'INCOME' | 'EXPENSE';
export type AppMode = 'DEMO' | 'PRO';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface BankAccount {
  id: string;
  name: string;
  balance: number;
  bankName: string;
  accountType: string;
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  date: string;
  note: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  isDemo?: boolean;
}

export interface AppState {
  accounts: BankAccount[];
  transactions: Transaction[];
  categories: Category[];
  user: User | null;
}
