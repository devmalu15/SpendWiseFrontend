import { Component, signal, inject } from '@angular/core';
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
    <div class="px-6 py-10 md:px-12 md:py-16">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 class="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2">
            PROFILE.
          </h1>
          <p class="text-sm font-bold uppercase tracking-[0.2em] text-dim">
            SETTINGS / PREFERENCES
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <!-- Avatar + Name -->
        <div class="flex flex-col items-center text-center">
          <div class="w-32 h-32 flex items-center justify-center bg-text text-bg text-5xl font-black tracking-tighter mb-6">
            {{ auth.user()?.fullName?.charAt(0)?.toUpperCase() }}
          </div>
          <div class="text-xl font-black tracking-tighter uppercase mb-1">{{ auth.user()?.fullName }}</div>
          <div class="text-[10px] font-bold uppercase tracking-widest text-dim mb-8">{{ auth.user()?.email }}</div>

          <button class="btn btn-danger w-full py-3 text-xs tracking-widest" (click)="logout()">
            SIGN OUT
          </button>
        </div>

        <!-- Settings -->
        <div class="lg:col-span-2 space-y-12">
          <section>
            <h2 class="text-xs font-bold uppercase tracking-[0.3em] mb-8 border-b border-border pb-4">ACCOUNT SETTINGS</h2>
            
            @if (saved()) { <div class="mb-6 p-4 border border-money-pos text-money-pos text-[10px] font-bold uppercase tracking-wider">SETTINGS SAVED</div> }
            @if (saveError()) { <div class="mb-6 p-4 border border-money-neg text-money-neg text-[10px] font-bold uppercase tracking-wider">{{ saveError() }}</div> }

            <div class="space-y-6">
              <div class="form-group">
                <label class="form-label" for="prof-name">FULL NAME</label>
                <input class="form-input" id="prof-name" [(ngModel)]="form.fullName" placeholder="YOUR NAME" />
              </div>

              <div class="form-group">
                <label class="form-label" for="prof-currency">CURRENCY</label>
                <select class="form-input" id="prof-currency" [(ngModel)]="form.currency">
                  @for (c of currencies; track c.code) {
                    <option [value]="c.code">{{ c.symbol }} {{ c.name | uppercase }} ({{ c.code }})</option>
                  }
                </select>
              </div>

              <button class="btn btn-primary px-12 py-3 text-xs tracking-widest" [disabled]="saving()" (click)="save()">
                {{ saving() ? 'SAVING...' : 'SAVE CHANGES' }}
              </button>
            </div>
          </section>

          <section>
            <h2 class="text-xs font-bold uppercase tracking-[0.3em] mb-8 border-b border-border pb-4">ABOUT SPENDWISE</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <div class="text-[10px] font-bold uppercase tracking-widest text-dim mb-2">VERSION</div>
                <div class="text-xs font-bold">1.0.0 / MINIMAL</div>
              </div>
              <div>
                <div class="text-[10px] font-bold uppercase tracking-widest text-dim mb-2">STATUS</div>
                <div class="text-xs font-bold text-money-pos uppercase">ACTIVE</div>
              </div>
              <div>
                <div class="text-[10px] font-bold uppercase tracking-widest text-dim mb-2">BUILD</div>
                <div class="text-xs font-bold uppercase">ANGULAR 21</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  public auth = inject(AuthService);
  private svc = inject(ExpenseService);
  private router = inject(Router);

  saving = signal(false);
  saved = signal(false);
  saveError = signal('');
  currencies = CURRENCIES;

  form = {
    fullName: this.auth.user()?.fullName || '',
    avatarColor: this.auth.user()?.avatarColor || '#000000',
    currency: this.auth.user()?.currency || 'INR'
  };

  constructor() {}

  save() {
    this.saved.set(false); this.saveError.set('');
    this.saving.set(true);
    this.svc.updateProfile(this.form).subscribe({
      next: () => {
        this.auth.updateUser({ fullName: this.form.fullName, avatarColor: this.form.avatarColor, currency: this.form.currency });
        this.saving.set(false); this.saved.set(true);
        setTimeout(() => this.saved.set(false), 2500);
      },
      error: () => { this.saveError.set('FAILED TO SAVE'); this.saving.set(false); }
    });
  }

  logout() { this.auth.logout(); }
}
