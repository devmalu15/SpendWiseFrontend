import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent) },
  { path: 'login-success', loadComponent: () => import('./components/auth/login-success.component').then(m => m.LoginSuccessComponent) },
  {
    path: 'app',
    loadComponent: () => import('./components/dashboard/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'expenses', loadComponent: () => import('./components/expenses/expenses.component').then(m => m.ExpensesComponent) },
      { path: 'budget', loadComponent: () => import('./components/budget/budget.component').then(m => m.BudgetComponent) },
      { path: 'stats', loadComponent: () => import('./components/stats/stats.component').then(m => m.StatsComponent) },
      { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
