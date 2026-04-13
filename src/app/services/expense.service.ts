import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Expense, CreateExpenseRequest, BudgetResponse, RecurringExpense, DashboardSummary, MonthlyStats, YearlyStats } from '../models';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  constructor(private api: ApiService) {}

  getExpenses(filters?: { month?: number; year?: number; category?: string; search?: string }): Observable<Expense[]> {
    const params: Record<string, string> = {};
    if (filters?.month) params['month'] = String(filters.month);
    if (filters?.year) params['year'] = String(filters.year);
    if (filters?.category) params['category'] = filters.category;
    if (filters?.search) params['search'] = filters.search;
    return this.api.get<Expense[]>('/api/expenses', params);
  }

  createExpense(req: CreateExpenseRequest): Observable<Expense> {
    return this.api.post<Expense>('/api/expenses', req);
  }

  updateExpense(id: number, req: Partial<CreateExpenseRequest>): Observable<Expense> {
    return this.api.put<Expense>(`/api/expenses/${id}`, req);
  }

  deleteExpense(id: number): Observable<unknown> {
    return this.api.delete(`/api/expenses/${id}`);
  }

  getBudget(month?: number, year?: number): Observable<BudgetResponse> {
    const params: Record<string, string> = {};
    if (month) params['month'] = String(month);
    if (year) params['year'] = String(year);
    return this.api.get<BudgetResponse>('/api/budget', params);
  }

  setBudget(req: { monthlyLimit: number; month: number; year: number; categoryLimits?: Record<string, number> }): Observable<BudgetResponse> {
    return this.api.post<BudgetResponse>('/api/budget', req);
  }

  getRecurring(): Observable<RecurringExpense[]> {
    return this.api.get<RecurringExpense[]>('/api/budget/recurring');
  }

  createRecurring(req: { title: string; amount: number; category: string; frequency: string; nextDueDate: string }): Observable<RecurringExpense> {
    return this.api.post<RecurringExpense>('/api/budget/recurring', req);
  }

  deleteRecurring(id: number): Observable<unknown> {
    return this.api.delete(`/api/budget/recurring/${id}`);
  }

  toggleRecurring(id: number): Observable<unknown> {
    return this.api.patch(`/api/budget/recurring/${id}/toggle`, {});
  }

  getDashboard(): Observable<DashboardSummary> {
    return this.api.get<DashboardSummary>('/api/stats/dashboard');
  }

  getMonthlyStats(month?: number, year?: number): Observable<MonthlyStats> {
    const params: Record<string, string> = {};
    if (month) params['month'] = String(month);
    if (year) params['year'] = String(year);
    return this.api.get<MonthlyStats>('/api/stats/monthly', params);
  }

  getYearlyStats(year?: number): Observable<YearlyStats> {
    const params: Record<string, string> = {};
    if (year) params['year'] = String(year);
    return this.api.get<YearlyStats>('/api/stats/yearly', params);
  }

  updateProfile(req: { fullName?: string; avatarColor?: string; currency?: string }): Observable<unknown> {
    return this.api.put('/api/auth/profile', req);
  }
}
