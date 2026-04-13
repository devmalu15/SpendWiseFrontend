import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ExpenseService } from '../../services/expense.service';
import { CURRENCIES } from '../../models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">
      <div class="page-header">
        <h1 class="page-title">Profile & Settings</h1>
      </div>

      <div class="profile-grid">
        <!-- Avatar + Name -->
        <div class="card profile-card">
          <div class="avatar-big" [style.background]="form.avatarColor">
            {{ auth.user()?.fullName?.charAt(0)?.toUpperCase() }}
          </div>
          <div class="profile-name">{{ auth.user()?.fullName }}</div>
          <div class="profile-email">{{ auth.user()?.email }}</div>

          <div class="color-picker">
            <label class="form-label">Avatar Color</label>
            <div class="colors">
              @for (c of avatarColors; track c) {
                <button class="color-btn" [style.background]="c" [class.selected]="form.avatarColor === c" (click)="form.avatarColor = c"></button>
              }
            </div>
          </div>
        </div>

        <!-- Settings -->
        <div class="card settings-card">
          <h2 class="section-title" style="margin-bottom:24px">Account Settings</h2>

          @if (saved()) { <div class="success-msg">Settings saved! ✅</div> }
          @if (saveError()) { <div class="error-msg">{{ saveError() }}</div> }

          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input class="form-input" [(ngModel)]="form.fullName" placeholder="Your name" />
          </div>

          <div class="form-group">
            <label class="form-label">Currency</label>
            <select class="form-input" [(ngModel)]="form.currency">
              @for (c of currencies; track c.code) {
                <option [value]="c.code">{{ c.symbol }} {{ c.name }} ({{ c.code }})</option>
              }
            </select>
          </div>

          <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:8px" [disabled]="saving()" (click)="save()">
            {{ saving() ? 'Saving...' : 'Save Changes' }}
          </button>

          <div class="divider"></div>

          <button class="btn btn-danger" style="width:100%;justify-content:center" (click)="logout()">
            🚪 Sign Out
          </button>
        </div>
      </div>

      <!-- Account Info -->
      <div class="card info-card">
        <h2 class="section-title" style="margin-bottom:16px">About SpendWise</h2>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Version</span><span class="info-val">1.0.0</span></div>
          <div class="info-item"><span class="info-label">Member Since</span><span class="info-val">{{ auth.user() ? 'Active' : '—' }}</span></div>
          <div class="info-item"><span class="info-label">Currency</span><span class="info-val">{{ auth.getCurrencySymbol() }} ({{ auth.user()?.currency }})</span></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { padding: 32px; max-width: 800px; margin: 0 auto; }
    .page-header { margin-bottom: 28px; }
    .page-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; }
    .profile-grid { display: grid; grid-template-columns: 280px 1fr; gap: 20px; margin-bottom: 20px; }
    .profile-card { padding: 32px 24px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .avatar-big { width: 88px; height: 88px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 36px; font-weight: 800; color: #fff; margin-bottom: 8px; transition: var(--transition); }
    .profile-name { font-size: 18px; font-weight: 700; }
    .profile-email { font-size: 13px; color: var(--text-muted); }
    .color-picker { width: 100%; margin-top: 16px; }
    .colors { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; }
    .color-btn { width: 32px; height: 32px; border-radius: 50%; border: 3px solid transparent; transition: var(--transition); }
    .color-btn.selected { border-color: #fff; transform: scale(1.15); }
    .color-btn:hover { transform: scale(1.1); }
    .settings-card { padding: 28px; display: flex; flex-direction: column; gap: 16px; }
    .section-title { font-size: 16px; font-weight: 700; }
    .success-msg { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); border-radius: var(--radius-sm); padding: 10px 14px; color: var(--success); font-size: 13px; }
    .error-msg { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: var(--radius-sm); padding: 10px 14px; color: var(--danger); font-size: 13px; }
    .divider { height: 1px; background: var(--border); margin: 4px 0; }
    .info-card { padding: 24px; }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .info-item { display: flex; flex-direction: column; gap: 4px; }
    .info-label { font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .info-val { font-size: 15px; font-weight: 600; }
    @media (max-width: 700px) { .profile-grid { grid-template-columns: 1fr; } .profile-page { padding: 16px; } .info-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class ProfileComponent {
  saving = signal(false);
  saved = signal(false);
  saveError = signal('');
  currencies = CURRENCIES;
  avatarColors = ['#6C63FF','#FF6584','#43D9AD','#F59E0B','#3B82F6','#10B981','#EF4444','#8B5CF6','#EC4899','#06B6D4'];

  form = {
    fullName: this.auth.user()?.fullName || '',
    avatarColor: this.auth.user()?.avatarColor || '#6C63FF',
    currency: this.auth.user()?.currency || 'INR'
  };

  constructor(public auth: AuthService, private svc: ExpenseService, private router: Router) {}

  save() {
    this.saved.set(false); this.saveError.set('');
    this.saving.set(true);
    this.svc.updateProfile(this.form).subscribe({
      next: (res: any) => {
        this.auth.updateUser({ fullName: this.form.fullName, avatarColor: this.form.avatarColor, currency: this.form.currency });
        this.saving.set(false); this.saved.set(true);
        setTimeout(() => this.saved.set(false), 2500);
      },
      error: () => { this.saveError.set('Failed to save. Please try again.'); this.saving.set(false); }
    });
  }

  logout() { this.auth.logout(); }
}
