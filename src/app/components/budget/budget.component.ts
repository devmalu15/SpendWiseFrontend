import { Component, OnInit, signal, inject } from '@angular/core';
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
    <div class="px-6 py-10 md:px-12 md:py-16">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 class="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2">
            BUDGET.
          </h1>
          <p class="text-sm font-bold uppercase tracking-[0.2em] text-dim">
            {{ currentMonthName }} / LIMITS
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border border border-border mb-16">
        <!-- Set Budget -->
        <div class="bg-bg p-8">
          <h2 class="text-xs font-bold uppercase tracking-[0.3em] mb-8">MONTHLY LIMIT</h2>
          <div class="space-y-6">
            <div class="form-group">
              <label class="form-label" for="budget-limit">TOTAL BUDGET ({{ sym }})</label>
              <input class="form-input text-2xl font-black tracking-tighter" id="budget-limit" type="number" [(ngModel)]="budgetLimit" placeholder="0" />
            </div>
            <button class="btn btn-primary w-full py-4 text-xs tracking-widest" [disabled]="savingBudget()" (click)="saveBudget()">
              {{ savingBudget() ? 'SAVING...' : 'UPDATE BUDGET' }}
            </button>
            @if (budgetSaved()) { <div class="text-[10px] font-bold uppercase tracking-widest text-money-pos text-center">SAVED SUCCESSFULLY</div> }
          </div>
        </div>

        <!-- Status -->
        <div class="bg-bg p-8">
          <h2 class="text-xs font-bold uppercase tracking-[0.3em] mb-8">CURRENT STATUS</h2>
          @if (budget()) {
            <div class="flex items-center gap-12">
              <div class="relative w-32 h-32 flex items-center justify-center">
                <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2" class="text-neutral-100 dark:text-neutral-900"/>
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="4"
                    [attr.stroke-dasharray]="282.7" [attr.stroke-dashoffset]="dashOffset()"
                    class="transition-all duration-1000"
                    [class.text-money-neg]="budget()!.percentUsed > 90"
                    [class.text-money-neu]="budget()!.percentUsed <= 90"/>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-2xl font-black tracking-tighter">{{ budget()!.percentUsed | number:'1.0-0' }}%</span>
                  <span class="text-[8px] font-bold uppercase tracking-widest text-dim">USED</span>
                </div>
              </div>
              <div class="flex-1 space-y-4">
                <div class="flex justify-between items-end">
                  <span class="text-[10px] font-bold uppercase tracking-widest text-dim">SPENT</span>
                  <span class="text-sm font-black tracking-tighter">{{ sym }}{{ budget()!.totalSpent | number:'1.0-0' }}</span>
                </div>
                <div class="flex justify-between items-end">
                  <span class="text-[10px] font-bold uppercase tracking-widest text-dim">REMAINING</span>
                  <span class="text-sm font-black tracking-tighter" [class.money-neg]="budget()!.remaining < 0">{{ sym }}{{ budget()!.remaining | number:'1.0-0' }}</span>
                </div>
              </div>
            </div>
          } @else {
            <div class="h-32 flex items-center justify-center border border-dashed border-border text-[10px] font-bold uppercase tracking-widest text-dim">
              SET A BUDGET TO SEE STATUS
            </div>
          }
        </div>
      </div>

      <!-- Category Breakdown -->
      @if (budget()?.categorySpent && catEntries.length > 0) {
        <div class="mb-16">
          <h2 class="text-xs font-bold uppercase tracking-[0.3em] mb-8 border-b border-border pb-4">CATEGORY BREAKDOWN</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            @for (entry of catEntries; track entry[0]) {
              <div class="group">
                <div class="flex justify-between items-end mb-3">
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-dim text-sm">{{ getCatIcon(entry[0]) }}</span>
                    <span class="text-[10px] font-bold uppercase tracking-widest">{{ entry[0] }}</span>
                  </div>
                  <span class="text-xs font-black tracking-tighter">{{ sym }}{{ entry[1] | number:'1.0-0' }}</span>
                </div>
                <div class="h-px bg-neutral-100 dark:bg-neutral-900 relative">
                  <div class="absolute inset-y-0 left-0 bg-text transition-all duration-700" [style.width.%]="catPct(entry[1])"></div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Recurring -->
      <div>
        <div class="flex items-center justify-between mb-8 border-b border-border pb-4">
          <h2 class="text-xs font-bold uppercase tracking-[0.3em]">RECURRING PAYMENTS</h2>
          <button class="text-[10px] font-bold uppercase tracking-widest hover:underline" (click)="showRecModal.set(true)">+ ADD RECURRING</button>
        </div>

        @if (loadingRec()) {
          <div class="space-y-4">
            @for (i of [1,2]; track i) { <div class="h-20 bg-neutral-100 dark:bg-neutral-900 animate-pulse"></div> }
          </div>
        } @else if (recurring().length === 0) {
          <div class="py-12 text-center border border-dashed border-border text-[10px] font-bold uppercase tracking-widest text-dim">
            NO RECURRING PAYMENTS FOUND
          </div>
        } @else {
          <div class="divide-y divide-border border-y border-border">
            @for (r of recurring(); track r.id) {
              <div class="py-6 flex items-center gap-6 group" [class.opacity-40]="!r.isActive">
                <div class="w-12 h-12 flex items-center justify-center border border-border">
                  <span class="material-icons text-dim">{{ getCatIcon(r.category) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-bold uppercase tracking-wider truncate">{{ r.title }}</div>
                  <div class="text-[10px] font-bold uppercase tracking-widest text-dim mt-1">
                    {{ r.frequency }} / NEXT: {{ r.nextDueDate | date:'d MMM' }}
                  </div>
                </div>
                <div class="text-right flex items-center gap-8">
                  <div class="text-lg font-black tracking-tighter">{{ sym }}{{ r.amount | number:'1.0-0' }}</div>
                  <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900" (click)="toggleRecurring(r.id)">
                      <span class="material-icons text-xs">{{ r.isActive ? 'pause' : 'play_arrow' }}</span>
                    </button>
                    <button class="p-2 hover:bg-red-50 dark:hover:bg-red-950 text-money-neg" (click)="deleteRecurring(r.id)">
                      <span class="material-icons text-xs">delete</span>
                    </button>
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
      <div class="modal-overlay" (click)="closeModal($event)" (keydown.escape)="showRecModal.set(false)" tabindex="-1" role="dialog">
        <div class="modal" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()" tabindex="-1">
          <h3 class="text-lg font-black tracking-tighter uppercase mb-8">NEW RECURRING</h3>
          @if (recError()) { 
            <div class="mb-6 p-4 border border-money-neg text-money-neg text-[10px] font-bold uppercase tracking-wider">
              {{ recError() }}
            </div> 
          }
          <div class="space-y-6">
            <div class="form-group">
              <label class="form-label" for="rec-title">DESCRIPTION *</label>
              <input class="form-input" id="rec-title" [(ngModel)]="recForm.title" placeholder="NETFLIX, RENT, ETC." />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label" for="rec-amount">AMOUNT *</label>
                <input class="form-input" id="rec-amount" type="number" [(ngModel)]="recForm.amount" placeholder="0" />
              </div>
              <div class="form-group">
                <label class="form-label" for="rec-freq">FREQUENCY</label>
                <select class="form-input" id="rec-freq" [(ngModel)]="recForm.frequency">
                  @for (f of frequencies; track f) { <option>{{ f | uppercase }}</option> }
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label" for="rec-cat">CATEGORY</label>
                <select class="form-input" id="rec-cat" [(ngModel)]="recForm.category">
                  @for (c of categories; track c) { <option>{{ c | uppercase }}</option> }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="rec-date">NEXT DUE DATE *</label>
                <input class="form-input" id="rec-date" type="date" [(ngModel)]="recForm.nextDueDate" />
              </div>
            </div>
            <div class="flex gap-4 pt-4">
              <button class="btn btn-ghost flex-1 py-3 text-xs font-bold uppercase tracking-widest" (click)="showRecModal.set(false)">CANCEL</button>
              <button class="btn btn-primary flex-1 py-3 text-xs font-bold uppercase tracking-widest" [disabled]="savingRec()" (click)="saveRecurring()">
                {{ savingRec() ? 'SAVING...' : 'SAVE' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class BudgetComponent implements OnInit {
  private svc = inject(ExpenseService);
  public auth = inject(AuthService);

  loading = signal(false); loadingRec = signal(true);
  savingBudget = signal(false); budgetSaved = signal(false);
  showRecModal = signal(false); savingRec = signal(false); recError = signal('');
  budget = signal<BudgetResponse | null>(null);
  recurring = signal<RecurringExpense[]>([]);
  budgetLimit = 0; catEntries: [string, number][] = [];
  categories = CATEGORIES; frequencies = FREQUENCIES;
  recForm = { title: '', amount: 0, category: 'Bills', frequency: 'Monthly', nextDueDate: new Date().toISOString().split('T')[0] };

  now = new Date();
  get currentMonthName() { return this.now.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase(); }
  get sym() { return this.auth.getCurrencySymbol(); }
  getCatIcon(c: string) { return CATEGORY_ICONS[c] || 'payments'; }
  catPct(v: number) { const max = Math.max(...this.catEntries.map(e => e[1])); return max ? (v / max) * 100 : 0; }
  dashOffset() { const pct = Math.min(this.budget()?.percentUsed || 0, 100); return 282.7 - (282.7 * pct / 100); }

  constructor() {}

  ngOnInit() { this.loadBudget(); this.loadRecurring(); }

  loadBudget() {
    this.svc.getBudget(this.now.getMonth() + 1, this.now.getFullYear()).subscribe({
      next: b => { this.budget.set(b); this.budgetLimit = b.monthlyLimit; this.catEntries = Object.entries(b.categorySpent || {}).sort((a,b) => b[1]-a[1]); },
      error: (err) => { console.error(err); }
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
