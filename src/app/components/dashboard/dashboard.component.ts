import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { DashboardSummary, CATEGORY_ICONS, CATEGORIES } from '../../models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="px-6 py-10 md:px-12 md:py-16">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 class="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2">
            HELLO, {{ firstName }}.
          </h1>
          <p class="text-sm font-bold uppercase tracking-[0.2em] text-dim">
            {{ monthName }} / SUMMARY
          </p>
        </div>
        <button class="btn btn-primary px-8 py-3 text-xs tracking-widest" (click)="showAdd.set(true)">
          ADD EXPENSE
        </button>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          @for (i of [1,2,3,4]; track i) { <div class="h-32 bg-neutral-100 dark:bg-neutral-900 animate-pulse"></div> }
        </div>
      } @else if (data()) {
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border mb-16">
          <div class="bg-bg p-8">
            <div class="text-[10px] font-bold uppercase tracking-widest text-dim mb-4">TOTAL SPENT</div>
            <div class="text-3xl font-black tracking-tighter money-neg">
              {{ sym }}{{ data()!.totalThisMonth | number:'1.0-0' }}
            </div>
            <div class="mt-4 text-[10px] font-bold uppercase tracking-wider" [class.money-neg]="data()!.changeFromLastMonth > 0" [class.money-pos]="data()!.changeFromLastMonth < 0">
              {{ data()!.changeFromLastMonth >= 0 ? '▲' : '▼' }}
              {{ sym }}{{ (data()!.changeFromLastMonth < 0 ? -data()!.changeFromLastMonth : data()!.changeFromLastMonth) | number:'1.0-0' }} VS LAST MONTH
            </div>
          </div>

          <div class="bg-bg p-8">
            <div class="text-[10px] font-bold uppercase tracking-widest text-dim mb-4">BUDGET USED</div>
            @if (data()!.monthlyBudget > 0) {
              <div class="text-3xl font-black tracking-tighter" [class.money-neg]="data()!.budgetPercentUsed > 90" [class.money-neu]="data()!.budgetPercentUsed <= 90">
                {{ data()!.budgetPercentUsed | number:'1.0-0' }}%
              </div>
              <div class="mt-4 h-1 bg-neutral-100 dark:bg-neutral-900">
                <div class="h-full transition-all duration-500" 
                     [style.width.%]="min100(data()!.budgetPercentUsed)"
                     [class.bg-money-neg]="data()!.budgetPercentUsed > 90"
                     [class.bg-money-neu]="data()!.budgetPercentUsed <= 90"></div>
              </div>
            } @else {
              <div class="text-3xl font-black tracking-tighter text-dim">—</div>
              <a routerLink="/app/budget" class="mt-4 inline-block text-[10px] font-bold uppercase tracking-widest hover:underline">SET BUDGET →</a>
            }
          </div>

          <div class="bg-bg p-8">
            <div class="text-[10px] font-bold uppercase tracking-widest text-dim mb-4">TODAY</div>
            <div class="text-3xl font-black tracking-tighter money-neg">
              {{ sym }}{{ data()!.todaySpent | number:'1.0-0' }}
            </div>
            <div class="mt-4 text-[10px] font-bold uppercase tracking-wider text-dim">
              WEEK: {{ sym }}{{ data()!.weekSpent | number:'1.0-0' }}
            </div>
          </div>

          <div class="bg-bg p-8">
            <div class="text-[10px] font-bold uppercase tracking-widest text-dim mb-4">TOP CATEGORY</div>
            <div class="text-3xl font-black tracking-tighter uppercase truncate">
              {{ data()!.topCategoryThisMonth || 'NONE' }}
            </div>
            <div class="mt-4 text-[10px] font-bold uppercase tracking-wider text-dim">
              {{ data()!.expensesThisMonth }} TRANSACTIONS
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <!-- Recent Expenses -->
          <div class="lg:col-span-2">
            <div class="flex items-center justify-between mb-8 border-b border-border pb-4">
              <h2 class="text-xs font-bold uppercase tracking-[0.3em]">RECENT TRANSACTIONS</h2>
              <a routerLink="/app/expenses" class="text-[10px] font-bold uppercase tracking-widest text-dim hover:text-text">VIEW ALL →</a>
            </div>
            
            @if (data()!.recentExpenses.length === 0) {
              <div class="py-12 text-center text-xs font-bold uppercase tracking-widest text-dim border border-dashed border-border">
                NO TRANSACTIONS RECORDED
              </div>
            } @else {
              <div class="divide-y divide-border">
                @for (e of data()!.recentExpenses; track e.id) {
                  <div class="py-6 flex items-center gap-6 group">
                    <div class="w-12 h-12 flex items-center justify-center border border-border group-hover:bg-neutral-50 dark:group-hover:bg-neutral-950 transition-colors">
                      <span class="material-icons text-dim">{{ getCatIcon(e.category) }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-bold uppercase tracking-wider truncate">{{ e.title }}</div>
                      <div class="text-[10px] font-bold uppercase tracking-widest text-dim mt-1">{{ e.category }}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-sm font-black tracking-tighter money-neg">{{ sym }}{{ e.amount | number:'1.0-0' }}</div>
                      <div class="text-[10px] font-bold uppercase tracking-widest text-dim mt-1">{{ e.date | date:'d MMM' }}</div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Category Breakdown -->
          <div>
            <div class="mb-8 border-b border-border pb-4">
              <h2 class="text-xs font-bold uppercase tracking-[0.3em]">BY CATEGORY</h2>
            </div>
            
            @if (catEntries.length === 0) {
              <div class="py-12 text-center text-xs font-bold uppercase tracking-widest text-dim border border-dashed border-border">
                NO DATA
              </div>
            } @else {
              <div class="space-y-8">
                @for (entry of catEntries; track entry[0]) {
                  <div>
                    <div class="flex justify-between items-end mb-2">
                      <div class="text-[10px] font-bold uppercase tracking-widest">{{ entry[0] }}</div>
                      <div class="text-xs font-black tracking-tighter">{{ sym }}{{ entry[1] | number:'1.0-0' }}</div>
                    </div>
                    <div class="h-px bg-neutral-100 dark:bg-neutral-900 relative">
                      <div class="absolute inset-y-0 left-0 bg-text transition-all duration-700" [style.width.%]="catPct(entry[1])"></div>
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
        <div class="modal-overlay" (click)="closeModal($event)" (keydown.escape)="showAdd.set(false)" tabindex="-1" role="dialog">
          <div class="modal" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()" tabindex="-1">
            <h3 class="text-lg font-black tracking-tighter uppercase mb-8">QUICK ADD</h3>
            @if (addError()) { 
              <div class="mb-6 p-4 border border-money-neg text-money-neg text-[10px] font-bold uppercase tracking-wider">
                {{ addError() }}
              </div> 
            }
            <div class="space-y-6">
              <div class="form-group">
                <label class="form-label" for="quick-title">DESCRIPTION</label>
                <input class="form-input" id="quick-title" [(ngModel)]="newTitle" placeholder="COFFEE, RENT, ETC." />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="form-label" for="quick-amount">AMOUNT</label>
                  <input class="form-input" id="quick-amount" type="number" [(ngModel)]="newAmount" placeholder="0" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="quick-category">CATEGORY</label>
                  <select class="form-input" id="quick-category" [(ngModel)]="newCategory">
                    @for (c of categories; track c) { <option>{{ c }}</option> }
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="quick-date">DATE</label>
                <input class="form-input" id="quick-date" type="date" [(ngModel)]="newDate" />
              </div>
              <div class="flex gap-4 pt-4">
                <button class="btn btn-ghost flex-1 py-3 text-xs font-bold uppercase tracking-widest" (click)="showAdd.set(false)">CANCEL</button>
                <button class="btn btn-primary flex-1 py-3 text-xs font-bold uppercase tracking-widest" [disabled]="adding()" (click)="addExpense()">
                  {{ adding() ? 'ADDING...' : 'ADD' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private svc = inject(ExpenseService);
  public auth = inject(AuthService);

  loading = signal(true);
  data = signal<DashboardSummary | null>(null);
  showAdd = signal(false);
  adding = signal(false);
  addError = signal('');
  newTitle = ''; newAmount = 0; newCategory = 'Food'; newDate = new Date().toISOString().split('T')[0];
  categories = CATEGORIES;
  catEntries: [string, number][] = [];

  get firstName() { return this.auth.user()?.fullName?.split(' ')[0] || ''; }
  get monthName() { return new Date().toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase(); }
  get sym() { return this.auth.getCurrencySymbol(); }

  constructor() {}

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

  getCatIcon(cat: string): string { return CATEGORY_ICONS[cat] || 'payments'; }
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
