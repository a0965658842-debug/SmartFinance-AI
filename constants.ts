
import { Category, BankAccount, Transaction } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: '飲食', icon: '🍔', color: 'bg-orange-500' },
  { id: 'cat-2', name: '交通', icon: '🚗', color: 'bg-blue-500' },
  { id: 'cat-3', name: '購物', icon: '🛍️', color: 'bg-purple-500' },
  { id: 'cat-4', name: '娛樂', icon: '🎬', color: 'bg-pink-500' },
  { id: 'cat-5', name: '醫療', icon: '🏥', color: 'bg-red-500' },
  { id: 'cat-6', name: '薪資', icon: '💰', color: 'bg-green-500' },
  { id: 'cat-7', name: '投資', icon: '📈', color: 'bg-teal-500' },
  { id: 'cat-8', name: '其它', icon: '📦', color: 'bg-gray-500' },
];

export const MOCK_ACCOUNTS: BankAccount[] = [
  { id: 'acc-1', name: '主要薪轉戶', bankName: '國泰世華', balance: 52000, accountType: '儲蓄', color: '#006400' },
  { id: 'acc-2', name: '日常消費卡', bankName: '台新銀行', balance: 8500, accountType: '數位帳戶', color: '#ff0000' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', accountId: 'acc-1', categoryId: 'cat-6', amount: 45000, type: 'INCOME', date: '2024-03-01', note: '3月薪資' },
  { id: 't2', accountId: 'acc-2', categoryId: 'cat-1', amount: 150, type: 'EXPENSE', date: '2024-03-02', note: '午餐 - 滷肉飯' },
  { id: 't3', accountId: 'acc-2', categoryId: 'cat-2', amount: 50, type: 'EXPENSE', date: '2024-03-02', note: '捷運' },
  { id: 't4', accountId: 'acc-2', categoryId: 'cat-1', amount: 800, type: 'EXPENSE', date: '2024-03-03', note: '週末聚餐' },
  { id: 't5', accountId: 'acc-1', categoryId: 'cat-7', amount: 10000, type: 'EXPENSE', date: '2024-03-04', note: '定期定額基金' },
];
