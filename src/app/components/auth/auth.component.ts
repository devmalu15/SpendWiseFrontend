import { Component, signal } from '@angular/core';
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
    <div class="auth-page">
      <div class="auth-left">
        <a routerLink="/" class="back-link">← Back</a>
        <div class="brand">
          <span class="brand-icon">💸</span>
          <span class="brand-name">SpendWise</span>
        </div>
        <div class="auth-card fade-in">
          <div class="tabs">
            <button class="tab" [class.active]="mode() === 'login'" (click)="mode.set('login')">Sign In</button>
            <button class="tab" [class.active]="mode() === 'register'" (click)="mode.set('register')">Sign Up</button>
          </div>

          @if (error()) {
            <div class="error-msg">{{ error() }}</div>
          }

          @if (mode() === 'register') {
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input class="form-input" type="text" [(ngModel)]="fullName" placeholder="Your name" />
            </div>
          }

          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" type="email" [(ngModel)]="email" placeholder="you@example.com" />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-wrap">
              <input class="form-input" [type]="showPwd() ? 'text' : 'password'" [(ngModel)]="password" placeholder="Min 6 characters" />
              <button class="eye-btn" type="button" (click)="showPwd.set(!showPwd())">{{ showPwd() ? '🙈' : '👁️' }}</button>
            </div>
          </div>

          <button class="btn btn-primary submit-btn" [disabled]="loading()" (click)="submit()">
            {{ loading() ? '...' : (mode() === 'login' ? 'Sign In' : 'Create Account') }}
          </button>

          <div class="divider"><span>or</span></div>

          <a [href]="googleUrl" class="btn-google">
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#EA4335" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.74-2.7.74-2.08 0-3.84-1.4-4.47-3.29H1.83v2.07A8 8 0 0 0 8.98 17Z"/><path fill="#4A90D9" d="M4.51 10.5A4.8 4.8 0 0 1 4.26 9c0-.52.09-1.02.25-1.5V5.43H1.83a8 8 0 0 0 0 7.14l2.68-2.07Z"/><path fill="#FBBC05" d="M8.98 4.21c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.43L4.51 7.5c.63-1.89 2.39-3.29 4.47-3.29Z"/></svg>
            Continue with Google
          </a>
        </div>
      </div>

      <div class="auth-right">
        <div class="promo">
          <div class="promo-icon">📊</div>
          <h2>Your money, your story</h2>
          <p>Beautiful analytics and smart tracking that actually helps you save more.</p>
          <div class="promo-features">
            <div class="pf">✅ Instant expense logging</div>
            <div class="pf">✅ Monthly budget alerts</div>
            <div class="pf">✅ Category breakdowns</div>
            <div class="pf">✅ Yearly trends</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
    .auth-left { display: flex; flex-direction: column; padding: 32px 48px; background: var(--bg); }
    .back-link { color: var(--text-muted); font-size: 14px; margin-bottom: 32px; transition: var(--transition); width: fit-content; }
    .back-link:hover { color: var(--text); }
    .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 40px; }
    .brand-icon { font-size: 28px; }
    .brand-name { font-family: var(--font-display); font-size: 22px; font-weight: 800; background: linear-gradient(135deg,#7C3AED,#06B6D4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .auth-card { flex: 1; display: flex; flex-direction: column; gap: 20px; max-width: 400px; width: 100%; margin: 0 auto; justify-content: center; }
    .tabs { display: flex; gap: 4px; background: var(--bg-elevated); border-radius: var(--radius-sm); padding: 4px; }
    .tab { flex: 1; padding: 10px; border-radius: 8px; font-size: 14px; font-weight: 600; background: transparent; color: var(--text-muted); transition: var(--transition); }
    .tab.active { background: var(--primary); color: #fff; }
    .error-msg { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: var(--radius-sm); padding: 12px 16px; color: var(--danger); font-size: 14px; }
    .input-wrap { position: relative; }
    .input-wrap .form-input { padding-right: 44px; }
    .eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; font-size: 16px; }
    .submit-btn { width: 100%; padding: 14px; font-size: 16px; border-radius: 12px; justify-content: center; }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .divider { display: flex; align-items: center; gap: 12px; color: var(--text-dim); font-size: 13px; }
    .divider::before,.divider::after { content:''; flex:1; height:1px; background: var(--border); }
    .btn-google { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 13px; border-radius: 12px; background: var(--bg-elevated); border: 1px solid var(--border); font-size: 14px; font-weight: 600; color: var(--text); transition: var(--transition); text-decoration: none; }
    .btn-google:hover { border-color: var(--border-hover); background: var(--bg-hover); }
    .auth-right { background: linear-gradient(135deg, #1a0a3a 0%, #0a1a2e 100%); display: flex; align-items: center; justify-content: center; padding: 48px; }
    .promo { max-width: 380px; }
    .promo-icon { font-size: 56px; margin-bottom: 24px; }
    .promo h2 { font-family: var(--font-display); font-size: 36px; font-weight: 800; margin-bottom: 16px; line-height: 1.2; }
    .promo p { color: var(--text-muted); font-size: 16px; line-height: 1.7; margin-bottom: 28px; }
    .promo-features { display: flex; flex-direction: column; gap: 10px; }
    .pf { color: var(--text-muted); font-size: 15px; }
    @media (max-width: 768px) {
      .auth-page { grid-template-columns: 1fr; }
      .auth-right { display: none; }
      .auth-left { padding: 24px; }
    }
  `]
})
export class AuthComponent {
  mode = signal<'login' | 'register'>('login');
  loading = signal(false);
  error = signal('');
  showPwd = signal(false);
  email = '';
  password = '';
  fullName = '';
  googleUrl = `${API_URL}/api/auth/google-login`;

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {
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
