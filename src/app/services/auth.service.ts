import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private _user = signal<AuthResponse | null>(null);
  private _loading = signal(true);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor() {
    this.initFromSession();
  }

  private initFromSession(): void {
    if (typeof window === 'undefined') {
      this._loading.set(false);
      return;
    }
    const token = sessionStorage.getItem('sw_token');
    const email = sessionStorage.getItem('sw_email');
    const userId = sessionStorage.getItem('sw_uid');
    const fullName = sessionStorage.getItem('sw_name');
    const avatarColor = sessionStorage.getItem('sw_color');
    const currency = sessionStorage.getItem('sw_currency');
    if (token && email && userId && fullName) {
      this._user.set({ token, email, userId, fullName, avatarColor: avatarColor || '#000000', currency: currency || 'INR', expiry: '' });
    }
    this._loading.set(false);
  }

  login(data: AuthResponse): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('sw_token', data.token);
      sessionStorage.setItem('sw_email', data.email);
      sessionStorage.setItem('sw_uid', data.userId);
      sessionStorage.setItem('sw_name', data.fullName);
      sessionStorage.setItem('sw_color', data.avatarColor || '#000000');
      sessionStorage.setItem('sw_currency', data.currency || 'INR');
    }
    this._user.set(data);
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      ['sw_token','sw_email','sw_uid','sw_name','sw_color','sw_currency'].forEach(k => sessionStorage.removeItem(k));
    }
    this._user.set(null);
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean { return !!this._user(); }

  getCurrencySymbol(): string {
    const map: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
    return map[this._user()?.currency || 'INR'] || '₹';
  }

  updateUser(data: Partial<AuthResponse>): void {
    const current = this._user();
    if (!current) return;
    const updated = { ...current, ...data };
    this.login(updated);
  }
}
