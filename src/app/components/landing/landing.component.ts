import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing">
      <nav class="nav">
        <div class="nav-logo"><span class="logo-icon">💸</span><span class="logo-text">SpendWise</span></div>
        <a routerLink="/login" class="btn btn-primary">Get Started</a>
      </nav>

      <section class="hero">
        <div class="hero-badge">✨ Smart Expense Tracking</div>
        <h1 class="hero-title">Know where every <span class="gradient-text">rupee goes</span></h1>
        <p class="hero-sub">Track expenses on the go, set budgets, and get powerful insights. Built for people who want real control over their money.</p>
        <div class="hero-actions">
          <a routerLink="/login" class="btn btn-primary btn-lg">Start Tracking Free</a>
          <a routerLink="/login" class="btn btn-ghost btn-lg">Sign In</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-val">100%</span><span class="stat-label">Free</span></div>
          <div class="stat-div"></div>
          <div class="stat"><span class="stat-val">8+</span><span class="stat-label">Categories</span></div>
          <div class="stat-div"></div>
          <div class="stat"><span class="stat-val">Real-time</span><span class="stat-label">Analytics</span></div>
        </div>
      </section>

      <section class="features">
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>Quick Add</h3>
          <p>Log an expense in seconds — just open the app and tap add.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <h3>Monthly Budget</h3>
          <p>Set budgets per category. Get warned before you overspend.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>Rich Stats</h3>
          <p>Monthly and yearly breakdowns with beautiful charts.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔄</div>
          <h3>Recurring Expenses</h3>
          <p>Track subscriptions and regular bills automatically.</p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing { min-height: 100vh; background: var(--bg); }
    .nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 48px; border-bottom: 1px solid var(--border); }
    .nav-logo { display: flex; align-items: center; gap: 10px; }
    .logo-icon { font-size: 28px; }
    .logo-text { font-family: var(--font-display); font-size: 22px; font-weight: 800; background: linear-gradient(135deg, #7C3AED, #06B6D4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero { text-align: center; padding: 100px 24px 80px; max-width: 720px; margin: 0 auto; }
    .hero-badge { display: inline-block; padding: 6px 18px; border-radius: 99px; background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); color: var(--primary-light); font-size: 13px; font-weight: 600; margin-bottom: 28px; }
    .hero-title { font-family: var(--font-display); font-size: clamp(40px, 6vw, 72px); font-weight: 800; line-height: 1.1; margin-bottom: 20px; }
    .gradient-text { background: linear-gradient(135deg, #7C3AED, #06B6D4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero-sub { font-size: 18px; color: var(--text-muted); max-width: 520px; margin: 0 auto 36px; line-height: 1.7; }
    .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 48px; }
    .btn-lg { padding: 14px 32px; font-size: 16px; border-radius: 12px; }
    .hero-stats { display: flex; align-items: center; justify-content: center; gap: 32px; }
    .stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .stat-val { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--text); }
    .stat-label { font-size: 13px; color: var(--text-muted); }
    .stat-div { width: 1px; height: 36px; background: var(--border); }
    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; max-width: 960px; margin: 0 auto; padding: 0 24px 80px; }
    .feature-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; transition: var(--transition); }
    .feature-card:hover { border-color: var(--border-hover); transform: translateY(-4px); box-shadow: var(--shadow-glow); }
    .feature-icon { font-size: 32px; margin-bottom: 14px; }
    .feature-card h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
    .feature-card p { color: var(--text-muted); font-size: 14px; line-height: 1.6; }
  `]
})
export class LandingComponent {}
