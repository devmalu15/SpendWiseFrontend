import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { MonthlyStats, YearlyStats, CATEGORY_ICONS } from '../../models';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="px-6 py-10 md:px-12 md:py-16">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 class="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2">
            STATISTICS.
          </h1>
          <p class="text-sm font-bold uppercase tracking-[0.2em] text-dim">
            INSIGHTS / PATTERNS
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <select class="form-input w-32" [(ngModel)]="selView" (change)="loadData()">
            <option value="monthly">MONTHLY</option>
            <option value="yearly">YEARLY</option>
          </select>
          @if (selView === 'monthly') {
            <select class="form-input w-32" [(ngModel)]="selMonth" (change)="loadData()">
              @for (m of months; track m.val) { <option [value]="m.val">{{ m.label | uppercase }}</option> }
            </select>
          }
          <select class="form-input w-24" [(ngModel)]="selYear" (change)="loadData()">
            @for (y of years; track y) { <option [value]="y">{{ y }}</option> }
          </select>
        </div>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          @for (i of [1,2,3]; track i) { <div class="h-40 bg-neutral-100 dark:bg-neutral-900 animate-pulse"></div> }
        </div>
      }

      <!-- MONTHLY VIEW -->
      @if (!loading() && selView === 'monthly' && monthly()) {
        <div class="space-y-16">
          <!-- KPI Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
            <div class="bg-bg p-8">
              <div class="text-[10px] font-bold uppercase tracking-widest text-dim mb-4">TOTAL SPENT</div>
              <div class="text-3xl font-black tracking-tighter money-neg">{{ sym }}{{ monthly()!.totalSpent | number:'1.0-0' }}</div>
            </div>
            <div class="bg-bg p-8">
              <div class="text-[10px] font-bold uppercase tracking-widest text-dim mb-4">DAILY AVG</div>
              <div class="text-3xl font-black tracking-tighter money-neg">{{ sym }}{{ monthly()!.dailyAverage | number:'1.0-0' }}</div>
            </div>
            <div class="bg-bg p-8">
              <div class="text-[10px] font-bold uppercase tracking-widest text-dim mb-4">TRANSACTIONS</div>
              <div class="text-3xl font-black tracking-tighter">{{ monthly()!.expenseCount }}</div>
            </div>
            <div class="bg-bg p-8">
              <div class="text-[10px] font-bold uppercase tracking-widest text-dim mb-4">TOP CATEGORY</div>
              <div class="text-3xl font-black tracking-tighter uppercase truncate">{{ monthly()!.topCategory || 'NONE' }}</div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <!-- Category Breakdown -->
            <div>
              <h3 class="text-xs font-bold uppercase tracking-[0.3em] mb-8 border-b border-border pb-4">BY CATEGORY</h3>
              <div class="space-y-8">
                @for (entry of monthlyCatEntries; track entry[0]) {
                  <div>
                    <div class="flex justify-between items-end mb-2">
                      <div class="flex items-center gap-2">
                        <span class="material-icons text-dim text-sm">{{ getCatIcon(entry[0]) }}</span>
                        <span class="text-[10px] font-bold uppercase tracking-widest">{{ entry[0] }}</span>
                      </div>
                      <div class="text-xs font-black tracking-tighter">
                        <span class="text-dim mr-2">{{ (entry[1] / monthly()!.totalSpent * 100) | number:'1.0-0' }}%</span>
                        {{ sym }}{{ entry[1] | number:'1.0-0' }}
                      </div>
                    </div>
                    <div class="h-px bg-neutral-100 dark:bg-neutral-900 relative">
                      <div class="absolute inset-y-0 left-0 bg-text transition-all duration-700" [style.width.%]="catPctM(entry[1])"></div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Daily Breakdown -->
            <div>
              <h3 class="text-xs font-bold uppercase tracking-[0.3em] mb-8 border-b border-border pb-4">DAILY TREND</h3>
              <div class="flex items-end gap-1 h-48 border-b border-border pt-8">
                @for (day of monthly()!.dailyBreakdown; track day.date) {
                  <div class="flex-1 bg-neutral-100 dark:bg-neutral-900 relative group" [style.height.%]="dayPct(day.amount)">
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-text text-bg text-[8px] px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                      {{ sym }}{{ day.amount | number:'1.0-0' }}
                    </div>
                  </div>
                }
              </div>
              <div class="flex justify-between mt-2 text-[8px] font-bold text-dim uppercase tracking-widest">
                <span>START</span>
                <span>END</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- YEARLY VIEW -->
      @if (!loading() && selView === 'yearly' && yearly()) {
        <div class="space-y-16">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
            <div class="bg-bg p-8">
              <div class="text-[10px] font-bold uppercase tracking-widest text-dim mb-4">TOTAL {{ selYear }}</div>
              <div class="text-3xl font-black tracking-tighter money-neg">{{ sym }}{{ yearly()!.totalSpent | number:'1.0-0' }}</div>
            </div>
            <div class="bg-bg p-8">
              <div class="text-[10px] font-bold uppercase tracking-widest text-dim mb-4">MONTHLY AVG</div>
              <div class="text-3xl font-black tracking-tighter money-neg">{{ sym }}{{ yearly()!.averageMonthlySpend | number:'1.0-0' }}</div>
            </div>
            <div class="bg-bg p-8">
              <div class="text-[10px] font-bold uppercase tracking-widest text-dim mb-4">HIGHEST MONTH</div>
              <div class="text-3xl font-black tracking-tighter uppercase truncate">{{ yearly()!.highestMonth }}</div>
            </div>
          </div>

          <div>
            <h3 class="text-xs font-bold uppercase tracking-[0.3em] mb-8 border-b border-border pb-4">MONTHLY TREND</h3>
            <div class="flex items-end gap-2 h-64 border-b border-border pt-12">
              @for (m of yearly()!.monthlyBreakdown; track m.month) {
                <div class="flex-1 bg-neutral-100 dark:bg-neutral-900 relative group" [style.height.%]="monthPct(m.amount)" [class.bg-text]="m.month === yearly()!.highestMonth">
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {{ sym }}{{ m.amount | number:'1.0-0' }}
                  </div>
                  <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-[8px] font-bold uppercase tracking-tighter text-dim">
                    {{ m.month.substring(0,3) }}
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="max-w-2xl">
            <h3 class="text-xs font-bold uppercase tracking-[0.3em] mb-8 border-b border-border pb-4">YEARLY CATEGORIES</h3>
            <div class="space-y-8">
              @for (entry of yearlyCatEntries; track entry[0]) {
                <div>
                  <div class="flex justify-between items-end mb-2">
                    <div class="text-[10px] font-bold uppercase tracking-widest">{{ entry[0] }}</div>
                    <div class="text-xs font-black tracking-tighter">{{ sym }}{{ entry[1] | number:'1.0-0' }}</div>
                  </div>
                  <div class="h-px bg-neutral-100 dark:bg-neutral-900 relative">
                    <div class="absolute inset-y-0 left-0 bg-text transition-all duration-700" [style.width.%]="catPctY(entry[1])"></div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      @if (!loading() && ((selView === 'monthly' && !monthly()) || (selView === 'yearly' && !yearly()))) {
        <div class="py-24 text-center border border-dashed border-border">
          <div class="text-4xl mb-4 text-dim">EMPTY</div>
          <p class="text-xs font-bold uppercase tracking-widest text-dim">NO DATA FOR THIS PERIOD</p>
        </div>
      }
    </div>
  `
})
export class StatsComponent implements OnInit {
  private svc = inject(ExpenseService);
  public auth = inject(AuthService);

  loading = signal(false);
  monthly = signal<MonthlyStats | null>(null);
  yearly = signal<YearlyStats | null>(null);
  selView = 'monthly';
  selMonth = String(new Date().getMonth() + 1);
  selYear = String(new Date().getFullYear());
  monthlyCatEntries: [string, number][] = [];
  monthlyPayEntries: [string, number][] = [];
  yearlyCatEntries: [string, number][] = [];

  months = Array.from({ length: 12 }, (_, i) => ({ val: String(i + 1), label: new Date(2000, i).toLocaleString('default', { month: 'long' }) }));
  years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

  get sym() { return this.auth.getCurrencySymbol(); }
  getCatIcon(c: string) { return CATEGORY_ICONS[c] || 'payments'; }

  constructor() {}
  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading.set(true);
    if (this.selView === 'monthly') {
      this.svc.getMonthlyStats(Number(this.selMonth), Number(this.selYear)).subscribe({
        next: d => {
          this.monthly.set(d);
          this.monthlyCatEntries = Object.entries(d.byCategory).sort((a,b) => b[1]-a[1]);
          this.monthlyPayEntries = Object.entries(d.byPaymentMethod).sort((a,b) => b[1]-a[1]);
          this.loading.set(false);
        },
        error: () => { this.monthly.set(null); this.loading.set(false); }
      });
    } else {
      this.svc.getYearlyStats(Number(this.selYear)).subscribe({
        next: d => {
          this.yearly.set(d);
          this.yearlyCatEntries = Object.entries(d.byCategory).sort((a,b) => b[1]-a[1]);
          this.loading.set(false);
        },
        error: () => { this.yearly.set(null); this.loading.set(false); }
      });
    }
  }

  catPctM(v: number) { const max = Math.max(...this.monthlyCatEntries.map(e => e[1])); return max ? (v/max)*100 : 0; }
  catPctY(v: number) { const max = Math.max(...this.yearlyCatEntries.map(e => e[1])); return max ? (v/max)*100 : 0; }
  dayPct(v: number) { const max = Math.max(...(this.monthly()?.dailyBreakdown.map(d => d.amount) || [1])); return max ? (v/max)*100 : 0; }
  monthPct(v: number) { const max = Math.max(...(this.yearly()?.monthlyBreakdown.map(m => m.amount) || [1])); return max ? (v/max)*100 : 0; }
}
