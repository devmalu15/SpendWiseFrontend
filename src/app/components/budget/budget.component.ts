import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { BudgetResponse, RecurringExpense, CATEGORIES, CATEGORY_ICONS, FREQUENCIES } from '../../models';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="budget-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Budget</h1>
          <p class="page-sub">{{ currentMonthName }}</p>
        </div>
      </div>

      <div class="budget-grid">
        <!-- Set Budget Card -->
        <div class="card budget-set-card">
          <h2 class="section-title">Monthly Budget</h2>
          <div class="form-group" style="margin-top:16px">
            <label class="form-label">Total Monthly Limit</label>
            <div class="amount-input-wrap">
              <span class="curr-sym">{{ sym }}</span>
              <input class="form-input amount-input" type="number" [(ngModel)]="budgetLimit" placeholder="e.g. 30000" />
            </div>
          </div>
          <button class="btn btn-primary" style="width:100%;margin-top:16px;justify-content:center" [disabled]="savingBudget()" (click)="saveBudget()">
            {{ savingBudget() ? 'Saving...' : 'Set Budget' }}
          </button>
          @if (budgetSaved()) { <div class="success-msg">Budget saved! ✅</div> }
        </div>

        <!-- Budget Status -->
        @if (budget()) {
          <div class="card budget-status-card fade-in">
            <h2 class="section-title">This Month's Status</h2>
            <div class="budget-ring-wrap">
              <div class="budget-donut" [class.danger]="budget()!.percentUsed > 90" [class.warning]="budget()!.percentUsed > 70 && budget()!.percentUsed <= 90">
                <svg viewBox="0 0 100 100" width="140" height="140">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-elevated)" stroke-width="12"/>
                  <circle cx="50" cy="50" r="40" fill="none" [attr.stroke]="donutColor()" stroke-width="12"
                    stroke-dasharray="251.2" [attr.stroke-dashoffset]="dashOffset()" stroke-linecap="round"
                    transform="rotate(-90 50 50)" style="transition:stroke-dashoffset 0.8s ease"/>
                </svg>
                <div class="donut-center">
                  <span class="donut-pct">{{ budget()!.percentUsed | number:'1.0-0' }}%</span>
                  <span class="donut-label">used</span>
                </div>
              </div>
            </div>
            <div class="budget-stats">
              <div class="bstat"><span class="bstat-label">Spent</span><span class="bstat-val">{{ sym }}{{ budget()!.totalSpent | number:'1.0-0' }}</span></div>
              <div class="bstat"><span class="bstat-label">Remaining</span><span class="bstat-val" [class.text-danger]="budget()!.remaining < 0">{{ sym }}{{ budget()!.remaining | number:'1.0-0' }}</span></div>
              <div class="bstat"><span class="bstat-label">Limit</span><span class="bstat-val">{{ sym }}{{ budget()!.monthlyLimit | number:'1.0-0' }}</span></div>
            </div>
          </div>
        } @else {
          <div class="card budget-status-card empty-budget">
            <div style="font-size:48px;margin-bottom:12px">🎯</div>
            <p>Set a monthly budget to start tracking your spending limits.</p>
          </div>
        }
      </div>

      <!-- Category Breakdown if budget exists -->
      @if (budget()?.categorySpent && catEntries.length > 0) {
        <div class="card cat-breakdown fade-in">
          <h2 class="section-title" style="margin-bottom:20px">Category Spending</h2>
          <div class="cat-grid">
            @for (entry of catEntries; track entry[0]) {
              <div class="cat-item">
                <div class="cat-item-header">
                  <span>{{ getCatIcon(entry[0]) }} {{ entry[0] }}</span>
                  <span class="cat-spent">{{ sym }}{{ entry[1] | number:'1.0-0' }}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="catPct(entry[1])"></div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Recurring Expenses -->
      <div class="recurring-section">
        <div class="section-header-row">
          <h2 class="section-title">Recurring Expenses</h2>
          <button class="btn btn-primary btn-sm" (click)="showRecModal.set(true)">+ Add Recurring</button>
        </div>

        @if (loadingRec()) {
          <div class="skeleton" style="height:100px;border-radius:12px"></div>
        } @else if (recurring().length === 0) {
          <div class="card empty-rec">
            <span style="font-size:32px">🔄</span>
            <p>No recurring expenses yet. Add subscriptions, rent, EMIs etc.</p>
          </div>
        } @else {
          <div class="rec-list">
            @for (r of recurring(); track r.id) {
              <div class="card rec-item" [class.inactive]="!r.isActive">
                <div class="rec-icon">{{ getCatIcon(r.category) }}</div>
                <div class="rec-main">
                  <div class="rec-title">{{ r.title }}</div>
                  <div class="rec-meta">
                    <span class="cat-pill" [class]="'cat-'+r.category">{{ r.category }}</span>
                    <span class="rec-freq">{{ r.frequency }}</span>
                    <span class="rec-due">Next: {{ r.nextDueDate | date:'d MMM' }}</span>
                  </div>
                </div>
                <div class="rec-right">
                  <span class="rec-amt">{{ sym }}{{ r.amount | number:'1.0-0' }}</span>
                  <div class="rec-actions">
                    <button class="btn btn-icon btn-ghost btn-sm" (click)="toggleRecurring(r.id)" [title]="r.isActive ? 'Pause' : 'Resume'">{{ r.isActive ? '⏸️' : '▶️' }}</button>
                    <button class="btn btn-icon btn-danger btn-sm" (click)="deleteRecurring(r.id)" title="Delete">🗑️</button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Recurring Modal -->
    @if (showRecModal()) {
      <div class="modal-overlay" (click)="closeModal($event)">
        <div class="modal">
          <h3 class="modal-title">Add Recurring Expense</h3>
          @if (recError()) { <div class="error-msg">{{ recError() }}</div> }
          <div class="form-group">
            <label class="form-label">Title *</label>
            <input class="form-input" [(ngModel)]="recForm.title" placeholder="e.g. Netflix, Rent, EMI..." />
          </div>
          <div class="form-row2">
            <div class="form-group">
              <label class="form-label">Amount *</label>
              <input class="form-input" type="number" [(ngModel)]="recForm.amount" placeholder="0" />
            </div>
            <div class="form-group">
              <label class="form-label">Frequency</label>
              <select class="form-input" [(ngModel)]="recForm.frequency">
                @for (f of frequencies; track f) { <option>{{ f }}</option> }
              </select>
            </div>
          </div>
          <div class="form-row2">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-input" [(ngModel)]="recForm.category">
                @for (c of categories; track c) { <option>{{ c }}</option> }
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Next Due Date *</label>
              <input class="form-input" type="date" [(ngModel)]="recForm.nextDueDate" />
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-ghost" (click)="showRecModal.set(false)">Cancel</button>
            <button class="btn btn-primary" [disabled]="savingRec()" (click)="saveRecurring()">{{ savingRec() ? 'Saving...' : 'Add' }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .budget-page { padding: 32px; max-width: 1000px; margin: 0 auto; }
    .page-header { margin-bottom: 28px; }
    .page-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; }
    .page-sub { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
    .budget-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .budget-set-card, .budget-status-card { padding: 28px; }
    .section-title { font-size: 16px; font-weight: 700; }
    .amount-input-wrap { display: flex; align-items: center; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; }
    .curr-sym { padding: 12px 14px; color: var(--text-muted); font-weight: 600; font-size: 16px; border-right: 1px solid var(--border); }
    .amount-input { border: none !important; background: transparent !important; box-shadow: none !important; border-radius: 0 !important; }
    .success-msg { color: var(--success); font-size: 13px; margin-top: 8px; text-align: center; }
    .empty-budget { padding: 40px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; color: var(--text-muted); }
    .budget-ring-wrap { display: flex; justify-content: center; margin: 20px 0; }
    .budget-donut { position: relative; display: inline-flex; }
    .donut-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .donut-pct { font-family: var(--font-display); font-size: 22px; font-weight: 800; }
    .donut-label { font-size: 11px; color: var(--text-muted); }
    .budget-stats { display: flex; justify-content: space-around; }
    .bstat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .bstat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .bstat-val { font-size: 15px; font-weight: 700; }
    .cat-breakdown { padding: 24px; margin-bottom: 24px; }
    .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .cat-item-header { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; font-weight: 600; }
    .cat-spent { color: var(--text-muted); }
    .progress-bar { height: 6px; background: var(--bg-elevated); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent)); border-radius: 3px; transition: width 0.6s ease; }
    .recurring-section { margin-top: 8px; }
    .section-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .empty-rec { display: flex; align-items: center; gap: 16px; padding: 24px; color: var(--text-muted); font-size: 14px; }
    .rec-list { display: flex; flex-direction: column; gap: 10px; }
    .rec-item { display: flex; align-items: center; gap: 14px; padding: 16px 20px; transition: var(--transition); }
    .rec-item.inactive { opacity: 0.5; }
    .rec-icon { font-size: 24px; width: 44px; height: 44px; background: var(--bg-elevated); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .rec-main { flex: 1; min-width: 0; }
    .rec-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
    .rec-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px; }
    .rec-freq { color: var(--accent); font-weight: 600; }
    .rec-due { color: var(--text-muted); }
    .rec-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
    .rec-amt { font-size: 16px; font-weight: 700; }
    .rec-actions { display: flex; gap: 4px; }
    .modal-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
    .form-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
    .error-msg { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: var(--radius-sm); padding: 10px 14px; color: var(--danger); font-size: 13px; margin-bottom: 12px; }
    @media (max-width: 700px) { .budget-grid { grid-template-columns: 1fr; } .budget-page { padding: 16px; } .form-row2 { grid-template-columns: 1fr; } }
  `]
})
export class BudgetComponent implements OnInit {
  loading = signal(false); loadingRec = signal(true);
  savingBudget = signal(false); budgetSaved = signal(false);
  showRecModal = signal(false); savingRec = signal(false); recError = signal('');
  budget = signal<BudgetResponse | null>(null);
  recurring = signal<RecurringExpense[]>([]);
  budgetLimit = 0; catEntries: [string, number][] = [];
  categories = CATEGORIES; frequencies = FREQUENCIES;
  recForm = { title: '', amount: 0, category: 'Bills', frequency: 'Monthly', nextDueDate: new Date().toISOString().split('T')[0] };

  now = new Date();
  get currentMonthName() { return this.now.toLocaleString('default', { month: 'long', year: 'numeric' }); }
  get sym() { return this.auth.getCurrencySymbol(); }
  getCatIcon(c: string) { return CATEGORY_ICONS[c] || '💰'; }
  catPct(v: number) { const max = Math.max(...this.catEntries.map(e => e[1])); return max ? (v / max) * 100 : 0; }
  donutColor() { const p = this.budget()?.percentUsed || 0; return p > 90 ? 'var(--danger)' : p > 70 ? 'var(--warning)' : 'var(--primary)'; }
  dashOffset() { const pct = Math.min(this.budget()?.percentUsed || 0, 100); return 251.2 - (251.2 * pct / 100); }

  constructor(private svc: ExpenseService, public auth: AuthService) {}

  ngOnInit() { this.loadBudget(); this.loadRecurring(); }

  loadBudget() {
    this.svc.getBudget(this.now.getMonth() + 1, this.now.getFullYear()).subscribe({
      next: b => { this.budget.set(b); this.budgetLimit = b.monthlyLimit; this.catEntries = Object.entries(b.categorySpent || {}).sort((a,b) => b[1]-a[1]); },
      error: () => {}
    });
  }

  loadRecurring() {
    this.loadingRec.set(true);
    this.svc.getRecurring().subscribe({ next: r => { this.recurring.set(r); this.loadingRec.set(false); }, error: () => this.loadingRec.set(false) });
  }

  saveBudget() {
    if (!this.budgetLimit) return;
    this.savingBudget.set(true);
    this.svc.setBudget({ monthlyLimit: this.budgetLimit, month: this.now.getMonth() + 1, year: this.now.getFullYear() }).subscribe({
      next: b => { this.budget.set(b); this.savingBudget.set(false); this.budgetSaved.set(true); setTimeout(() => this.budgetSaved.set(false), 2000); },
      error: () => this.savingBudget.set(false)
    });
  }

  saveRecurring() {
    this.recError.set('');
    if (!this.recForm.title || !this.recForm.amount) { this.recError.set('Title and amount required.'); return; }
    this.savingRec.set(true);
    this.svc.createRecurring({ ...this.recForm, nextDueDate: new Date(this.recForm.nextDueDate).toISOString() }).subscribe({
      next: () => { this.showRecModal.set(false); this.savingRec.set(false); this.loadRecurring(); },
      error: () => { this.recError.set('Failed to save.'); this.savingRec.set(false); }
    });
  }

  toggleRecurring(id: number) { this.svc.toggleRecurring(id).subscribe(() => this.loadRecurring()); }
  deleteRecurring(id: number) { if (!confirm('Delete?')) return; this.svc.deleteRecurring(id).subscribe(() => this.loadRecurring()); }
  closeModal(e: MouseEvent) { if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.showRecModal.set(false); }
}
