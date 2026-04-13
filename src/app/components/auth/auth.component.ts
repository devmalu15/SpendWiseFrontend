import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService, API_URL } from '../../services/api.service';
import { AuthResponse } from '../../models';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center px-6">
      <div class="w-full max-w-md">
        <div class="mb-12 text-center">
          <a routerLink="/" class="text-xs font-bold uppercase tracking-widest text-muted hover:text-text transition-colors">← Back to Home</a>
          <h1 class="text-4xl font-black tracking-tighter mt-6 uppercase">
            {{ mode() === 'login' ? 'Sign In' : 'Create Account' }}
          </h1>
        </div>

        <div class="space-y-8">
          <div class="flex border-b border-border">
            <button 
              class="flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors"
              [class.text-text]="mode() === 'login'"
              [class.text-dim]="mode() !== 'login'"
              (click)="mode.set('login')"
            >
              Login
            </button>
            <button 
              class="flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors"
              [class.text-text]="mode() === 'register'"
              [class.text-dim]="mode() !== 'register'"
              (click)="mode.set('register')"
            >
              Register
            </button>
          </div>

          @if (error()) {
            <div class="p-4 border border-money-neg text-money-neg text-xs font-bold uppercase tracking-wider">
              {{ error() }}
            </div>
          }

          <div class="space-y-6">
            @if (mode() === 'register') {
              <div class="form-group">
                <label class="form-label" for="full-name">Full Name</label>
                <input class="form-input" id="full-name" type="text" [(ngModel)]="fullName" placeholder="John Doe" />
              </div>
            }

            <div class="form-group">
              <label class="form-label" for="email">Email Address</label>
              <input class="form-input" id="email" type="email" [(ngModel)]="email" placeholder="name@example.com" />
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <div class="relative">
                <input 
                  class="form-input pr-10" 
                  id="password"
                  [type]="showPwd() ? 'text' : 'password'" 
                  [(ngModel)]="password" 
                  placeholder="••••••••" 
                />
                <button 
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                  (click)="showPwd.set(!showPwd())"
                  type="button"
                >
                  <span class="material-icons">{{ showPwd() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <button 
              class="btn btn-primary w-full py-4 text-sm font-bold uppercase tracking-widest" 
              [disabled]="loading()" 
              (click)="submit()"
              type="submit"
            >
              {{ loading() ? 'Processing...' : (mode() === 'login' ? 'Continue' : 'Create Account') }}
            </button>

            <div class="relative py-4">
              <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-border"></div></div>
              <div class="relative flex justify-center text-xs uppercase font-bold tracking-widest"><span class="bg-bg px-4 text-dim">Or</span></div>
            </div>

            <a [href]="googleUrl" class="btn btn-ghost w-full py-4 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3">
              <svg width="18" height="18" viewBox="0 0 18 18" class="grayscale invert dark:invert-0"><path fill="currentColor" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"/><path fill="currentColor" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.74-2.7.74-2.08 0-3.84-1.4-4.47-3.29H1.83v2.07A8 8 0 0 0 8.98 17Z"/><path fill="currentColor" d="M4.51 10.5A4.8 4.8 0 0 1 4.26 9c0-.52.09-1.02.25-1.5V5.43H1.83a8 8 0 0 0 0 7.14l2.68-2.07Z"/><path fill="currentColor" d="M8.98 4.21c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.43L4.51 7.5c.63-1.89 2.39-3.29 4.47-3.29Z"/></svg>
              Google Login
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuthComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  mode = signal<'login' | 'register'>('login');
  loading = signal(false);
  error = signal('');
  showPwd = signal(false);
  email = '';
  password = '';
  fullName = '';
  googleUrl = `${API_URL}/api/auth/google-login`;

  constructor() {
    if (this.auth.isLoggedIn()) this.router.navigate(['/app']);
  }

  submit(): void {
    this.error.set('');
    if (!this.email || !this.password) { this.error.set('Please fill all fields.'); return; }
    if (this.mode() === 'register' && !this.fullName) { this.error.set('Please enter your name.'); return; }
    this.loading.set(true);
    const path = this.mode() === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = this.mode() === 'login'
      ? { email: this.email, password: this.password }
      : { fullName: this.fullName, email: this.email, password: this.password };
    this.api.post<AuthResponse>(path, body).subscribe({
      next: (res) => { this.auth.login(res); this.router.navigate(['/app']); },
      error: (err) => { this.error.set(err.error?.message || 'Something went wrong.'); this.loading.set(false); }
    });
  }
}
