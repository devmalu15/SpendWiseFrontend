import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { Expense, CATEGORIES, PAYMENT_METHODS, CATEGORY_ICONS, CreateExpenseRequest } from '../../models';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="expenses-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Expenses</h1>
          <p class="page-sub">{{ filtered().length }} transactions</p>
        </div>
        <button class="btn btn-primary" (click)="openAdd()">+ Add Expense</button>
      </div>

      <!-- Filters -->
      <div class="filters card">
        <div class="filter-row">
          <input class="form-input search-input" [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="🔍 Search expenses..." />
          <select class="form-input filter-select" [(ngModel)]="filterCategory" (change)="applyFilters()">
            <option value="">All Categories</option>
            @for (c of categories; track c) { <option>{{ c }}</option> }
          </select>
          <select class="form-input filter-select" [(ngModel)]="filterMonth" (change)="applyFilters()">
            @for (m of months; track m.val) { <option [value]="m.val">{{ m.label }}</option> }
          </select>
          <select class="form-input filter-select" [(ngModel)]="filterYear" (change)="applyFilters()">
            @for (y of years; track y) { <option [value]="y">{{ y }}</option> }
          </select>
        </div>
        <div class="filter-summary">
          Total: <strong>{{ sym }}{{ totalFiltered() | number:'1.0-0' }}</strong>
        </div>
      </div>

      <!-- Expense list -->
      @if (loading()) {
        <div class="exp-list">
          @for (i of [1,2,3,4,5]; track i) { <div class="skeleton" style="height:72px; border-radius:12px"></div> }
        </div>
      } @else if (filtered().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">🧾</div>
          <h3>No expenses found</h3>
          <p>Try adjusting your filters or add a new expense.</p>
        </div>
      } @else {
        <div class="exp-list fade-in">
          @for (e of filtered(); track e.id) {
            <div class="exp-item">
              <div class="exp-icon">{{ getCatIcon(e.category) }}</div>
              <div class="exp-main">
                <div class="exp-title-row">
                  <span class="exp-title">{{ e.title }}</span>
                  <span class="cat-pill" [class]="'cat-'+e.category">{{ e.category }}</span>
                </div>
                <div class="exp-meta">
                  <span>{{ e.date | date:'d MMM yyyy' }}</span>
                  @if (e.paymentMethod) { <span class="dot">·</span><span>{{ e.paymentMethod }}</span> }
                  @if (e.tags) { <span class="dot">·</span><span class="tags">{{ e.tags }}</span> }
                </div>
              </div>
              <div class="exp-right">
                <span class="exp-amt">{{ sym }}{{ e.amount | number:'1.2-2' }}</span>
                <div class="exp-actions">
                  <button class="btn btn-icon btn-ghost" (click)="openEdit(e)" title="Edit">✏️</button>
                  <button class="btn btn-icon btn-danger" (click)="deleteExpense(e.id)" title="Delete">🗑️</button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Add/Edit Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal($event)">
        <div class="modal" style="max-width:520px">
          <h3 class="modal-title">{{ editing ? 'Edit Expense' : 'Add Expense' }}</h3>
          @if (formError()) { <div class="error-msg">{{ formError() }}</div> }
          <div class="form-group">
            <label class="form-label">Title *</label>
            <input class="form-input" [(ngModel)]="form.title" placeholder="What did you spend on?" />
          </div>
          <div class="form-row2">
            <div class="form-group">
              <label class="form-label">Amount *</label>
              <input class="form-input" type="number" [(ngModel)]="form.amount" placeholder="0.00" />
            </div>
            <div class="form-group">
              <label class="form-label">Date *</label>
              <input class="form-input" type="date" [(ngModel)]="form.date" />
            </div>
          </div>
          <div class="form-row2">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-input" [(ngModel)]="form.category">
                @for (c of categories; track c) { <option>{{ c }}</option> }
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Payment Method</label>
              <select class="form-input" [(ngModel)]="form.paymentMethod">
                <option value="">— Select —</option>
                @for (p of paymentMethods; track p) { <option>{{ p }}</option> }
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <input class="form-input" [(ngModel)]="form.description" placeholder="Optional note..." />
          </div>
          <div class="form-group">
            <label class="form-label">Tags</label>
            <input class="form-input" [(ngModel)]="form.tags" placeholder="e.g. work, personal (comma separated)" />
          </div>
          <div class="modal-actions">
            <button class="btn btn-ghost" (click)="showModal.set(false)">Cancel</button>
            <button class="btn btn-primary" [disabled]="saving()" (click)="saveExpense()">
              {{ saving() ? 'Saving...' : (editing ? 'Update' : 'Add Expense') }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .expenses-page { padding: 32px; max-width: 900px; margin: 0 auto; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .page-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; }
    .page-sub { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
    .filters { padding: 16px 20px; margin-bottom: 20px; }
    .filter-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
    .search-input { flex: 2; min-width: 180px; }
    .filter-select { flex: 1; min-width: 130px; }
    .filter-summary { font-size: 13px; color: var(--text-muted); }
    .filter-summary strong { color: var(--text); }
    .exp-list { display: flex; flex-direction: column; gap: 10px; }
    .exp-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 20px; display: flex; align-items: center; gap: 14px; transition: var(--transition); }
    .exp-item:hover { border-color: var(--border-hover); }
    .exp-icon { font-size: 24px; width: 44px; height: 44px; background: var(--bg-elevated); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .exp-main { flex: 1; min-width: 0; }
    .exp-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
    .exp-title { font-size: 15px; font-weight: 600; }
    .exp-meta { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .dot { color: var(--text-dim); }
    .tags { color: var(--accent); }
    .exp-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
    .exp-amt { font-size: 16px; font-weight: 700; }
    .exp-actions { display: flex; gap: 4px; opacity: 0; transition: var(--transition); }
    .exp-item:hover .exp-actions { opacity: 1; }
    .empty-state { text-align: center; padding: 80px 20px; }
    .empty-icon { font-size: 52px; margin-bottom: 16px; }
    .empty-state h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .empty-state p { color: var(--text-muted); font-size: 14px; }
    .modal-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
    .form-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
    .error-msg { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: var(--radius-sm); padding: 10px 14px; color: var(--danger); font-size: 13px; margin-bottom: 12px; }
    @media (max-width: 600px) { .expenses-page { padding: 16px; } .filter-row { flex-direction: column; } .form-row2 { grid-template-columns: 1fr; } }
  `]
})
export class ExpensesComponent implements OnInit {
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  formError = signal('');
  all = signal<Expense[]>([]);
  filtered = signal<Expense[]>([]);

  searchTerm = ''; filterCategory = ''; filterMonth = String(new Date().getMonth() + 1); filterYear = String(new Date().getFullYear());
  categories = CATEGORIES; paymentMethods = PAYMENT_METHODS;
  editing: Expense | null = null;
  form: Partial<CreateExpenseRequest> & { paymentMethod?: string; description?: string; tags?: string } = {};

  months = [
    { val: '', label: 'All Months' },
    ...Array.from({ length: 12 }, (_, i) => ({ val: String(i + 1), label: new Date(2000, i).toLocaleString('default', { month: 'long' }) }))
  ];
  years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

  get sym() { return this.auth.getCurrencySymbol(); }
  totalFiltered() { return this.filtered().reduce((s, e) => s + e.amount, 0); }
  getCatIcon(c: string) { return CATEGORY_ICONS[c] || '💰'; }

  constructor(private svc: ExpenseService, public auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const params: Record<string, number | string> = {};
    if (this.filterMonth) params['month'] = Number(this.filterMonth);
    if (this.filterYear) params['year'] = Number(this.filterYear);
    this.svc.getExpenses({ month: this.filterMonth ? Number(this.filterMonth) : undefined, year: Number(this.filterYear) }).subscribe({
      next: data => { this.all.set(data); this.applyFilters(); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  applyFilters() {
    let data = this.all();
    if (this.filterCategory) data = data.filter(e => e.category === this.filterCategory);
    if (this.searchTerm) data = data.filter(e => e.title.toLowerCase().includes(this.searchTerm.toLowerCase()));
    this.filtered.set(data);
    this.load();
  }

  openAdd() {
    this.editing = null;
    this.form = { title: '', amount: 0, category: 'Food', date: new Date().toISOString().split('T')[0], paymentMethod: '', description: '', tags: '' };
    this.formError.set(''); this.showModal.set(true);
  }

  openEdit(e: Expense) {
    this.editing = e;
    this.form = { title: e.title, amount: e.amount, category: e.category, date: e.date.split('T')[0], paymentMethod: e.paymentMethod || '', description: e.description || '', tags: e.tags || '' };
    this.formError.set(''); this.showModal.set(true);
  }

  saveExpense() {
    this.formError.set('');
    if (!this.form.title || !this.form.amount) { this.formError.set('Title and amount are required.'); return; }
    this.saving.set(true);
    const payload = { ...this.form, date: new Date(this.form.date!).toISOString() } as CreateExpenseRequest;
    const obs = this.editing ? this.svc.updateExpense(this.editing.id, payload) : this.svc.createExpense(payload);
    obs.subscribe({
      next: () => { this.showModal.set(false); this.saving.set(false); this.load(); },
      error: () => { this.formError.set('Failed to save.'); this.saving.set(false); }
    });
  }

  deleteExpense(id: number) {
    if (!confirm('Delete this expense?')) return;
    this.svc.deleteExpense(id).subscribe({ next: () => this.load() });
  }

  closeModal(e: MouseEvent) { if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.showModal.set(false); }
}
