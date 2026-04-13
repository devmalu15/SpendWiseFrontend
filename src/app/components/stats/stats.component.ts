import { Component, OnInit, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
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
    <div class="stats-page">
      <div class="page-header">
        <div><h1 class="page-title">Statistics</h1><p class="page-sub">Insights into your spending patterns</p></div>
        <div class="period-controls">
          <select class="form-input" [(ngModel)]="selView" (change)="loadData()" style="width:130px">
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          @if (selView === 'monthly') {
            <select class="form-input" [(ngModel)]="selMonth" (change)="loadData()" style="width:130px">
              @for (m of months; track m.val) { <option [value]="m.val">{{ m.label }}</option> }
            </select>
          }
          <select class="form-input" [(ngModel)]="selYear" (change)="loadData()" style="width:100px">
            @for (y of years; track y) { <option [value]="y">{{ y }}</option> }
          </select>
        </div>
      </div>

      @if (loading()) {
        <div class="stats-skeleton">
          @for (i of [1,2,3]; track i) { <div class="skeleton" style="height:160px;border-radius:16px"></div> }
        </div>
      }

      <!-- MONTHLY VIEW -->
      @if (!loading() && selView === 'monthly' && monthly()) {
        <div class="stats-content fade-in">
          <!-- KPI Cards -->
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-icon" style="background:rgba(124,58,237,0.15)">💸</div>
              <div class="kpi-info">
                <span class="kpi-label">Total Spent</span>
                <span class="kpi-val">{{ sym }}{{ monthly()!.totalSpent | number:'1.0-0' }}</span>
              </div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon" style="background:rgba(6,182,212,0.15)">📅</div>
              <div class="kpi-info">
                <span class="kpi-label">Daily Average</span>
                <span class="kpi-val">{{ sym }}{{ monthly()!.dailyAverage | number:'1.0-0' }}</span>
              </div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon" style="background:rgba(16,185,129,0.15)">🧾</div>
              <div class="kpi-info">
                <span class="kpi-label">Transactions</span>
                <span class="kpi-val">{{ monthly()!.expenseCount }}</span>
              </div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon" style="background:rgba(245,158,11,0.15)">🏆</div>
              <div class="kpi-info">
                <span class="kpi-label">Top Category</span>
                <span class="kpi-val">{{ monthly()!.topCategory }}</span>
              </div>
            </div>
          </div>

          <div class="charts-grid">
            <!-- Category Breakdown -->
            <div class="card chart-card">
              <h3 class="chart-title">Spending by Category</h3>
              <div class="cat-bars">
                @for (entry of monthlyCatEntries; track entry[0]) {
                  <div class="cat-bar-row">
                    <div class="cat-bar-label">
                      <span>{{ getCatIcon(entry[0]) }} {{ entry[0] }}</span>
                      <span class="cat-bar-amt">{{ sym }}{{ entry[1] | number:'1.0-0' }}</span>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill" [style.width.%]="catPctM(entry[1])" [style.background]="catColor(entry[0])"></div>
                    </div>
                    <span class="cat-bar-pct">{{ (entry[1] / monthly()!.totalSpent * 100) | number:'1.0-0' }}%</span>
                  </div>
                }
              </div>
            </div>

            <!-- Daily Breakdown -->
            <div class="card chart-card">
              <h3 class="chart-title">Daily Spending</h3>
              <div class="daily-chart">
                @for (day of monthly()!.dailyBreakdown; track day.date) {
                  <div class="day-col" [title]="day.date + ': ' + sym + day.amount">
                    <div class="day-bar" [style.height.%]="dayPct(day.amount)"></div>
                    <span class="day-label">{{ day.date | date:'d' }}</span>
                  </div>
                }
                @if (monthly()!.dailyBreakdown.length === 0) {
                  <div class="no-data">No daily data</div>
                }
              </div>
            </div>

            <!-- Payment Methods -->
            @if (monthlyPayEntries.length > 0) {
              <div class="card chart-card">
                <h3 class="chart-title">Payment Methods</h3>
                <div class="pay-list">
                  @for (entry of monthlyPayEntries; track entry[0]) {
                    <div class="pay-row">
                      <span class="pay-name">{{ entry[0] }}</span>
                      <div class="bar-track">
                        <div class="bar-fill" [style.width.%]="payPct(entry[1])" style="background:var(--accent)"></div>
                      </div>
                      <span class="pay-amt">{{ sym }}{{ entry[1] | number:'1.0-0' }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- YEARLY VIEW -->
      @if (!loading() && selView === 'yearly' && yearly()) {
        <div class="stats-content fade-in">
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-icon" style="background:rgba(124,58,237,0.15)">💸</div>
              <div class="kpi-info"><span class="kpi-label">Total {{ selYear }}</span><span class="kpi-val">{{ sym }}{{ yearly()!.totalSpent | number:'1.0-0' }}</span></div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon" style="background:rgba(6,182,212,0.15)">📊</div>
              <div class="kpi-info"><span class="kpi-label">Monthly Average</span><span class="kpi-val">{{ sym }}{{ yearly()!.averageMonthlySpend | number:'1.0-0' }}</span></div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon" style="background:rgba(245,158,11,0.15)">📈</div>
              <div class="kpi-info"><span class="kpi-label">Highest Month</span><span class="kpi-val">{{ yearly()!.highestMonth }}</span></div>
            </div>
          </div>

          <div class="card chart-card full-width">
            <h3 class="chart-title">Monthly Trend</h3>
            <div class="monthly-bars">
              @for (m of yearly()!.monthlyBreakdown; track m.month) {
                <div class="month-col">
                  <span class="month-amt">{{ m.amount > 0 ? sym + (m.amount | number:'1.0-0') : '' }}</span>
                  <div class="month-bar" [style.height.%]="monthPct(m.amount)" [class.highest]="m.month === yearly()!.highestMonth"></div>
                  <span class="month-label">{{ m.month }}</span>
                </div>
              }
            </div>
          </div>

          <div class="card chart-card">
            <h3 class="chart-title">Category Breakdown ({{ selYear }})</h3>
            <div class="cat-bars">
              @for (entry of yearlyCatEntries; track entry[0]) {
                <div class="cat-bar-row">
                  <div class="cat-bar-label">
                    <span>{{ getCatIcon(entry[0]) }} {{ entry[0] }}</span>
                    <span class="cat-bar-amt">{{ sym }}{{ entry[1] | number:'1.0-0' }}</span>
                  </div>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width.%]="catPctY(entry[1])" [style.background]="catColor(entry[0])"></div>
                  </div>
                  <span class="cat-bar-pct">{{ yearly()!.totalSpent > 0 ? (entry[1] / yearly()!.totalSpent * 100 | number:'1.0-0') : 0 }}%</span>
                </div>
              }
            </div>
          </div>
        </div>
      }

      @if (!loading() && ((selView === 'monthly' && !monthly()) || (selView === 'yearly' && !yearly()))) {
        <div class="no-data-state">
          <div style="font-size:52px;margin-bottom:16px">📭</div>
          <h3>No data for this period</h3>
          <p>Add some expenses to see your stats here.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .stats-page { padding: 32px; max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
    .page-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; }
    .page-sub { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
    .period-controls { display: flex; gap: 10px; flex-wrap: wrap; }
    .stats-skeleton { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .kpi-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; display: flex; align-items: center; gap: 16px; transition: var(--transition); }
    .kpi-card:hover { border-color: var(--border-hover); transform: translateY(-2px); }
    .kpi-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
    .kpi-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .kpi-label { font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .kpi-val { font-family: var(--font-display); font-size: 20px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .full-width { grid-column: 1 / -1; }
    .chart-card { padding: 24px; }
    .chart-title { font-size: 15px; font-weight: 700; margin-bottom: 20px; }
    .cat-bars { display: flex; flex-direction: column; gap: 14px; }
    .cat-bar-row { display: grid; grid-template-columns: 1fr 120px 40px; align-items: center; gap: 10px; }
    .cat-bar-label { display: flex; justify-content: space-between; font-size: 13px; font-weight: 500; }
    .cat-bar-amt { color: var(--text-muted); }
    .bar-track { height: 8px; background: var(--bg-elevated); border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; }
    .cat-bar-pct { font-size: 12px; color: var(--text-muted); text-align: right; }
    .daily-chart { display: flex; align-items: flex-end; gap: 4px; height: 120px; overflow-x: auto; padding-bottom: 24px; }
    .day-col { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; min-width: 20px; height: 100%; justify-content: flex-end; position: relative; }
    .day-bar { width: 14px; background: linear-gradient(to top, var(--primary), var(--accent)); border-radius: 3px 3px 0 0; min-height: 2px; transition: height 0.6s ease; }
    .day-label { font-size: 10px; color: var(--text-dim); position: absolute; bottom: 0; }
    .no-data { color: var(--text-muted); font-size: 14px; }
    .pay-list { display: flex; flex-direction: column; gap: 12px; }
    .pay-row { display: grid; grid-template-columns: 100px 1fr 80px; align-items: center; gap: 10px; }
    .pay-name { font-size: 13px; font-weight: 500; }
    .pay-amt { font-size: 13px; font-weight: 700; text-align: right; }
    .monthly-bars { display: flex; align-items: flex-end; gap: 8px; height: 180px; padding-bottom: 32px; overflow-x: auto; }
    .month-col { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; min-width: 40px; height: 100%; justify-content: flex-end; position: relative; }
    .month-bar { width: 100%; background: var(--bg-elevated); border-radius: 6px 6px 0 0; min-height: 2px; transition: height 0.8s ease; background: linear-gradient(to top, rgba(124,58,237,0.5), rgba(6,182,212,0.4)); }
    .month-bar.highest { background: linear-gradient(to top, var(--primary), var(--accent)); }
    .month-label { font-size: 11px; color: var(--text-muted); position: absolute; bottom: 0; }
    .month-amt { font-size: 10px; color: var(--text-dim); white-space: nowrap; margin-bottom: 2px; }
    .no-data-state { text-align: center; padding: 80px 20px; }
    .no-data-state h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .no-data-state p { color: var(--text-muted); }
    @media (max-width: 768px) { .stats-page { padding: 16px; } .charts-grid { grid-template-columns: 1fr; } .cat-bar-row { grid-template-columns: 1fr 80px 36px; } }
  `]
})
export class StatsComponent implements OnInit {
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
  getCatIcon(c: string) { return CATEGORY_ICONS[c] || '💰'; }

  constructor(private svc: ExpenseService, public auth: AuthService) {}
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
  payPct(v: number) { const max = Math.max(...this.monthlyPayEntries.map(e => e[1])); return max ? (v/max)*100 : 0; }
  dayPct(v: number) { const max = Math.max(...(this.monthly()?.dailyBreakdown.map(d => d.amount) || [1])); return max ? (v/max)*100 : 0; }
  monthPct(v: number) { const max = Math.max(...(this.yearly()?.monthlyBreakdown.map(m => m.amount) || [1])); return max ? (v/max)*100 : 0; }

  catColor(cat: string) {
    const map: Record<string,string> = { Food:'var(--cat-food)', Transport:'var(--cat-transport)', Shopping:'var(--cat-shopping)', Health:'var(--cat-health)', Entertainment:'var(--cat-entertainment)', Bills:'var(--cat-bills)', Education:'var(--cat-education)', Other:'var(--cat-other)' };
    return map[cat] || 'var(--primary)';
  }
}
