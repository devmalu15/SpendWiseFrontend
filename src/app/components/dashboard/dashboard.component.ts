import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { DashboardSummary, CATEGORY_ICONS } from '../../models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h1 class="page-title">Good {{ greeting }}, {{ firstName }}! 👋</h1>
          <p class="page-sub">Here's your financial snapshot for {{ monthName }}.</p>
        </div>
        <button class="btn btn-primary" (click)="showAdd.set(true)">+ Add Expense</button>
      </div>

      @if (loading()) {
        <div class="skeleton-grid">
          @for (i of [1,2,3,4]; track i) { <div class="skeleton" style="height:120px"></div> }
        </div>
      } @else if (data()) {
        <!-- Summary Cards -->
        <div class="summary-grid fade-in">
          <div class="summary-card primary">
            <div class="card-label">This Month</div>
            <div class="card-value">{{ sym }}{{ data()!.totalThisMonth | number:'1.0-0' }}</div>
            <div class="card-change" [class.up]="data()!.changeFromLastMonth > 0" [class.down]="data()!.changeFromLastMonth < 0">
              {{ data()!.changeFromLastMonth >= 0 ? '▲' : '▼' }}
              {{ sym }}{{ (data()!.changeFromLastMonth < 0 ? -data()!.changeFromLastMonth : data()!.changeFromLastMonth) | number:'1.0-0' }} vs last month
            </div>
          </div>

          <div class="summary-card">
            <div class="card-label">Budget Used</div>
            @if (data()!.monthlyBudget > 0) {
              <div class="card-value">{{ data()!.budgetPercentUsed | number:'1.0-0' }}%</div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="min100(data()!.budgetPercentUsed)"
                     [class.danger]="data()!.budgetPercentUsed > 90"
                     [class.warning]="data()!.budgetPercentUsed > 70 && data()!.budgetPercentUsed <= 90"></div>
              </div>
              <div class="card-meta">{{ sym }}{{ data()!.totalThisMonth | number:'1.0-0' }} of {{ sym }}{{ data()!.monthlyBudget | number:'1.0-0' }}</div>
            } @else {
              <div class="card-value no-budget">—</div>
              <a routerLink="/app/budget" class="set-budget-link">Set a budget →</a>
            }
          </div>

          <div class="summary-card">
            <div class="card-label">Today's Spend</div>
            <div class="card-value">{{ sym }}{{ data()!.todaySpent | number:'1.0-0' }}</div>
            <div class="card-meta">This week: {{ sym }}{{ data()!.weekSpent | number:'1.0-0' }}</div>
          </div>

          <div class="summary-card">
            <div class="card-label">Transactions</div>
            <div class="card-value">{{ data()!.expensesThisMonth }}</div>
            <div class="card-meta">Top: {{ data()!.topCategoryThisMonth }}</div>
          </div>
        </div>

        <!-- Bottom Grid -->
        <div class="bottom-grid">
          <!-- Recent Expenses -->
          <div class="card recent-card">
            <div class="section-header">
              <h2 class="section-title">Recent Expenses</h2>
              <a routerLink="/app/expenses" class="see-all">See all →</a>
            </div>
            @if (data()!.recentExpenses.length === 0) {
              <div class="empty">No expenses yet. <a routerLink="/app/expenses">Add one!</a></div>
            } @else {
              <div class="expense-list">
                @for (e of data()!.recentExpenses; track e.id) {
                  <div class="expense-row">
                    <div class="expense-icon">{{ getCatIcon(e.category) }}</div>
                    <div class="expense-info">
                      <span class="expense-title">{{ e.title }}</span>
                      <span class="expense-cat cat-pill" [class]="'cat-'+e.category">{{ e.category }}</span>
                    </div>
                    <div class="expense-right">
                      <span class="expense-amount">{{ sym }}{{ e.amount | number:'1.0-0' }}</span>
                      <span class="expense-date">{{ e.date | date:'d MMM' }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Category Breakdown -->
          <div class="card cat-card">
            <div class="section-header">
              <h2 class="section-title">By Category</h2>
            </div>
            @if (catEntries.length === 0) {
              <div class="empty">No data yet.</div>
            } @else {
              <div class="cat-list">
                @for (entry of catEntries; track entry[0]) {
                  <div class="cat-row">
                    <div class="cat-left">
                      <span class="cat-emoji">{{ getCatIcon(entry[0]) }}</span>
                      <span class="cat-name">{{ entry[0] }}</span>
                    </div>
                    <div class="cat-right">
                      <span class="cat-amount">{{ sym }}{{ entry[1] | number:'1.0-0' }}</span>
                      <div class="cat-bar-wrap">
                        <div class="cat-bar" [style.width.%]="catPct(entry[1])"></div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- Quick Add Modal -->
      @if (showAdd()) {
        <div class="modal-overlay" (click)="closeModal($event)">
          <div class="modal">
            <h3 class="modal-title">Quick Add Expense</h3>
            @if (addError()) { <div class="error-msg">{{ addError() }}</div> }
            <div class="form-group">
              <label class="form-label">What did you spend on?</label>
              <input class="form-input" [(ngModel)]="newTitle" placeholder="e.g. Coffee, Groceries..." />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Amount</label>
                <input class="form-input" type="number" [(ngModel)]="newAmount" placeholder="0" />
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-input" [(ngModel)]="newCategory">
                  @for (c of categories; track c) { <option>{{ c }}</option> }
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Date</label>
              <input class="form-input" type="date" [(ngModel)]="newDate" />
            </div>
            <div class="modal-actions">
              <button class="btn btn-ghost" (click)="showAdd.set(false)">Cancel</button>
              <button class="btn btn-primary" [disabled]="adding()" (click)="addExpense()">
                {{ adding() ? 'Adding...' : 'Add Expense' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 32px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
    .page-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; }
    .page-sub { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
    .skeleton-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .summary-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; transition: var(--transition); }
    .summary-card:hover { border-color: var(--border-hover); transform: translateY(-2px); box-shadow: var(--shadow-glow); }
    .summary-card.primary { background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1)); border-color: rgba(124,58,237,0.3); }
    .card-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: 10px; }
    .card-value { font-family: var(--font-display); font-size: 30px; font-weight: 800; margin-bottom: 8px; }
    .no-budget { color: var(--text-dim); }
    .card-change { font-size: 12px; color: var(--text-muted); }
    .card-change.up { color: var(--danger); }
    .card-change.down { color: var(--success); }
    .card-meta { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
    .progress-bar { height: 6px; background: var(--bg-elevated); border-radius: 3px; margin: 8px 0; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--primary); border-radius: 3px; transition: width 0.6s ease; }
    .progress-fill.warning { background: var(--warning); }
    .progress-fill.danger { background: var(--danger); }
    .set-budget-link { font-size: 13px; color: var(--primary-light); }
    .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .recent-card, .cat-card { padding: 24px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .section-title { font-size: 16px; font-weight: 700; }
    .see-all { font-size: 13px; color: var(--primary-light); }
    .empty { color: var(--text-muted); font-size: 14px; padding: 20px 0; text-align: center; }
    .empty a { color: var(--primary-light); }
    .expense-list { display: flex; flex-direction: column; gap: 12px; }
    .expense-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
    .expense-row:last-child { border-bottom: none; }
    .expense-icon { font-size: 22px; width: 36px; height: 36px; background: var(--bg-elevated); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .expense-info { flex: 1; min-width: 0; }
    .expense-title { display: block; font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .expense-cat { display: inline-block; margin-top: 3px; }
    .expense-right { text-align: right; flex-shrink: 0; }
    .expense-amount { display: block; font-size: 15px; font-weight: 700; }
    .expense-date { display: block; font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .cat-list { display: flex; flex-direction: column; gap: 14px; }
    .cat-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .cat-left { display: flex; align-items: center; gap: 8px; min-width: 110px; }
    .cat-emoji { font-size: 18px; }
    .cat-name { font-size: 13px; font-weight: 500; }
    .cat-right { flex: 1; display: flex; align-items: center; gap: 10px; justify-content: flex-end; }
    .cat-amount { font-size: 14px; font-weight: 700; min-width: 70px; text-align: right; }
    .cat-bar-wrap { width: 80px; height: 6px; background: var(--bg-elevated); border-radius: 3px; overflow: hidden; }
    .cat-bar { height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent)); border-radius: 3px; transition: width 0.6s ease; }
    .modal-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
    .error-msg { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: var(--radius-sm); padding: 10px 14px; color: var(--danger); font-size: 13px; margin-bottom: 4px; }
    @media (max-width: 1100px) { .summary-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 768px) { .dashboard { padding: 20px; } .summary-grid { grid-template-columns: 1fr 1fr; } .bottom-grid { grid-template-columns: 1fr; } }
    @media (max-width: 480px) { .summary-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  data = signal<DashboardSummary | null>(null);
  showAdd = signal(false);
  adding = signal(false);
  addError = signal('');
  newTitle = ''; newAmount = 0; newCategory = 'Food'; newDate = new Date().toISOString().split('T')[0];
  categories = ['Food','Transport','Shopping','Health','Entertainment','Bills','Education','Other'];
  catEntries: [string, number][] = [];

  get greeting() {
    const h = new Date().getHours();
    return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  }
  get firstName() { return this.auth.user()?.fullName?.split(' ')[0] || ''; }
  get monthName() { return new Date().toLocaleString('default', { month: 'long', year: 'numeric' }); }
  get sym() { return this.auth.getCurrencySymbol(); }

  constructor(private svc: ExpenseService, public auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getDashboard().subscribe({
      next: d => {
        this.data.set(d);
        this.catEntries = Object.entries(d.categoryBreakdown).sort((a,b) => b[1]-a[1]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getCatIcon(cat: string): string { return CATEGORY_ICONS[cat] || '💰'; }
  catPct(amt: number): number {
    const max = Math.max(...this.catEntries.map(e => e[1]));
    return max ? (amt / max) * 100 : 0;
  }
  min100(v: number): number { return Math.min(v, 100); }

  closeModal(e: MouseEvent) { if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.showAdd.set(false); }

  addExpense() {
    this.addError.set('');
    if (!this.newTitle || !this.newAmount) { this.addError.set('Title and amount required.'); return; }
    this.adding.set(true);
    this.svc.createExpense({ title: this.newTitle, amount: this.newAmount, category: this.newCategory, date: new Date(this.newDate).toISOString() }).subscribe({
      next: () => { this.showAdd.set(false); this.newTitle = ''; this.newAmount = 0; this.adding.set(false); this.load(); },
      error: () => { this.addError.set('Failed to add expense.'); this.adding.set(false); }
    });
  }
}
