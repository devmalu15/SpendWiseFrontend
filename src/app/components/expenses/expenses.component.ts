import { Component, OnInit, signal, inject } from '@angular/core';
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
    <div class="px-6 py-10 md:px-12 md:py-16">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 class="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2">
            TRANSACTIONS.
          </h1>
          <p class="text-sm font-bold uppercase tracking-[0.2em] text-dim">
            {{ filtered().length }} RECORDS FOUND
          </p>
        </div>
        <button class="btn btn-primary px-8 py-3 text-xs tracking-widest" (click)="openAdd()">
          NEW TRANSACTION
        </button>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 border border-border p-4">
        <div class="md:col-span-2">
          <input class="form-input" [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="SEARCH BY DESCRIPTION..." />
        </div>
        <select class="form-input" [(ngModel)]="filterCategory" (change)="applyFilters()">
          <option value="">ALL CATEGORIES</option>
          @for (c of categories; track c) { <option>{{ c | uppercase }}</option> }
        </select>
        <div class="grid grid-cols-2 gap-2">
          <select class="form-input" [(ngModel)]="filterMonth" (change)="applyFilters()">
            @for (m of months; track m.val) { <option [value]="m.val">{{ m.label | uppercase }}</option> }
          </select>
          <select class="form-input" [(ngModel)]="filterYear" (change)="applyFilters()">
            @for (y of years; track y) { <option [value]="y">{{ y }}</option> }
          </select>
        </div>
      </div>

      <div class="mb-8 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-dim">
        <span>TOTAL FOR PERIOD</span>
        <span class="text-lg font-black tracking-tighter text-text">{{ sym }}{{ totalFiltered() | number:'1.0-0' }}</span>
      </div>

      <!-- Expense list -->
      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3,4,5]; track i) { <div class="h-20 bg-neutral-100 dark:bg-neutral-900 animate-pulse"></div> }
        </div>
      } @else if (filtered().length === 0) {
        <div class="py-24 text-center border border-dashed border-border">
          <div class="text-4xl mb-4 text-dim">EMPTY</div>
          <p class="text-xs font-bold uppercase tracking-widest text-dim">NO TRANSACTIONS MATCH YOUR FILTERS</p>
        </div>
      } @else {
        <div class="divide-y divide-border border-y border-border">
          @for (e of filtered(); track e.id) {
            <div class="py-6 flex items-center gap-6 group">
              <div class="w-12 h-12 flex items-center justify-center border border-border group-hover:bg-neutral-50 dark:group-hover:bg-neutral-950 transition-colors">
                <span class="material-icons text-dim">{{ getCatIcon(e.category) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3">
                  <span class="text-sm font-bold uppercase tracking-wider truncate">{{ e.title }}</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 border border-border text-dim uppercase tracking-tighter">{{ e.category }}</span>
                </div>
                <div class="text-[10px] font-bold uppercase tracking-widest text-dim mt-1">
                  {{ e.date | date:'d MMM yyyy' }} @if (e.paymentMethod) { <span class="mx-1">/</span> {{ e.paymentMethod }} }
                </div>
              </div>
              <div class="text-right flex items-center gap-8">
                <div>
                  <div class="text-lg font-black tracking-tighter money-neg">{{ sym }}{{ e.amount | number:'1.2-2' }}</div>
                </div>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900" (click)="openEdit(e)" title="Edit">
                    <span class="material-icons text-xs">edit</span>
                  </button>
                  <button class="p-2 hover:bg-red-50 dark:hover:bg-red-950 text-money-neg" (click)="deleteExpense(e.id)" title="Delete">
                    <span class="material-icons text-xs">delete</span>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Add/Edit Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal($event)" (keydown.escape)="showModal.set(false)" tabindex="-1" role="dialog">
        <div class="modal max-w-xl" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()" tabindex="-1">
          <h3 class="text-lg font-black tracking-tighter uppercase mb-8">{{ editing ? 'EDIT TRANSACTION' : 'NEW TRANSACTION' }}</h3>
          @if (formError()) { 
            <div class="mb-6 p-4 border border-money-neg text-money-neg text-[10px] font-bold uppercase tracking-wider">
              {{ formError() }}
            </div> 
          }
          <div class="space-y-6">
            <div class="form-group">
              <label class="form-label" for="exp-title">DESCRIPTION *</label>
              <input class="form-input" id="exp-title" [(ngModel)]="form.title" placeholder="WHAT DID YOU SPEND ON?" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label" for="exp-amount">AMOUNT *</label>
                <input class="form-input" id="exp-amount" type="number" [(ngModel)]="form.amount" placeholder="0.00" />
              </div>
              <div class="form-group">
                <label class="form-label" for="exp-date">DATE *</label>
                <input class="form-input" id="exp-date" type="date" [(ngModel)]="form.date" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label" for="exp-category">CATEGORY</label>
                <select class="form-input" id="exp-category" [(ngModel)]="form.category">
                  @for (c of categories; track c) { <option>{{ c | uppercase }}</option> }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="exp-payment">PAYMENT METHOD</label>
                <select class="form-input" id="exp-payment" [(ngModel)]="form.paymentMethod">
                  <option value="">— SELECT —</option>
                  @for (p of paymentMethods; track p) { <option>{{ p | uppercase }}</option> }
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="exp-tags">TAGS</label>
              <input class="form-input" id="exp-tags" [(ngModel)]="form.tags" placeholder="WORK, PERSONAL, ETC." />
            </div>
            <div class="flex gap-4 pt-4">
              <button class="btn btn-ghost flex-1 py-3 text-xs font-bold uppercase tracking-widest" (click)="showModal.set(false)">CANCEL</button>
              <button class="btn btn-primary flex-1 py-3 text-xs font-bold uppercase tracking-widest" [disabled]="saving()" (click)="saveExpense()">
                {{ saving() ? 'SAVING...' : (editing ? 'UPDATE' : 'SAVE') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ExpensesComponent implements OnInit {
  private svc = inject(ExpenseService);
  public auth = inject(AuthService);

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
  getCatIcon(c: string) { return CATEGORY_ICONS[c] || 'payments'; }

  constructor() {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getExpenses({ 
      month: this.filterMonth ? Number(this.filterMonth) : undefined, 
      year: Number(this.filterYear) 
    }).subscribe({
      next: data => { this.all.set(data); this.applyFilters(); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  applyFilters() {
    let data = this.all();
    if (this.filterCategory) data = data.filter(e => e.category === this.filterCategory);
    if (this.searchTerm) data = data.filter(e => e.title.toLowerCase().includes(this.searchTerm.toLowerCase()));
    this.filtered.set(data);
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
