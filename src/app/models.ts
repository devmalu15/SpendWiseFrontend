export interface AuthResponse {
  token: string;
  email: string;
  userId: string;
  fullName: string;
  avatarColor?: string;
  currency?: string;
  expiry: string;
}

export interface Expense {
  id: number;
  title: string;
  description?: string;
  amount: number;
  category: string;
  paymentMethod?: string;
  tags?: string;
  date: string;
  createdAt: string;
  isRecurring: boolean;
}

export interface CreateExpenseRequest {
  title: string;
  description?: string;
  amount: number;
  category: string;
  paymentMethod?: string;
  tags?: string;
  date: string;
}

export interface BudgetResponse {
  id: number;
  monthlyLimit: number;
  month: number;
  year: number;
  totalSpent: number;
  remaining: number;
  percentUsed: number;
  categoryLimits?: Record<string, number>;
  categorySpent?: Record<string, number>;
}

export interface RecurringExpense {
  id: number;
  title: string;
  amount: number;
  category: string;
  frequency: string;
  nextDueDate: string;
  isActive: boolean;
}

export interface DashboardSummary {
  totalThisMonth: number;
  totalLastMonth: number;
  monthlyBudget: number;
  budgetPercentUsed: number;
  expensesThisMonth: number;
  todaySpent: number;
  weekSpent: number;
  topCategoryThisMonth: string;
  recentExpenses: RecentExpense[];
  categoryBreakdown: Record<string, number>;
  changeFromLastMonth: number;
}

export interface RecentExpense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
}

export interface MonthlyStats {
  month: number;
  year: number;
  totalSpent: number;
  budgetLimit: number;
  percentUsed: number;
  expenseCount: number;
  dailyAverage: number;
  byCategory: Record<string, number>;
  byPaymentMethod: Record<string, number>;
  dailyBreakdown: { date: string; amount: number }[];
  topCategory: string;
  topCategoryAmount: number;
}

export interface YearlyStats {
  year: number;
  totalSpent: number;
  monthlyBreakdown: { month: string; amount: number }[];
  byCategory: Record<string, number>;
  averageMonthlySpend: number;
  highestMonth: string;
  highestMonthAmount: number;
}

export const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Bills', 'Education', 'Other'];
export const PAYMENT_METHODS = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'];
export const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

export const CATEGORY_ICONS: Record<string, string> = {
  Food: 'restaurant', Transport: 'directions_car', Shopping: 'shopping_bag', Health: 'medical_services',
  Entertainment: 'sports_esports', Bills: 'receipt_long', Education: 'school', Other: 'payments'
};

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];
