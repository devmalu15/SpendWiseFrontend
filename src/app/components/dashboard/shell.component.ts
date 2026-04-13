import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="collapsed()">
        <div class="sidebar-header">
          <span class="logo-icon">💸</span>
          @if (!collapsed()) { <span class="logo-text">SpendWise</span> }
        </div>

        <nav class="sidebar-nav">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active" class="nav-item" [title]="item.label">
              <span class="nav-icon">{{ item.icon }}</span>
              @if (!collapsed()) { <span class="nav-label">{{ item.label }}</span> }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/app/profile" routerLinkActive="active" class="nav-item user-item" [title]="user()?.fullName || ''">
            <div class="avatar" [style.background]="user()?.avatarColor">
              {{ user()?.fullName?.charAt(0)?.toUpperCase() }}
            </div>
            @if (!collapsed()) {
              <div class="user-info">
                <span class="user-name">{{ user()?.fullName }}</span>
                <span class="user-email">{{ user()?.email }}</span>
              </div>
            }
          </a>
          <button class="collapse-btn" (click)="collapsed.set(!collapsed())" [title]="collapsed() ? 'Expand' : 'Collapse'">
            {{ collapsed() ? '→' : '←' }}
          </button>
        </div>
      </aside>

      <!-- Main -->
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell { display: flex; height: 100vh; overflow: hidden; }
    .sidebar { display: flex; flex-direction: column; width: 240px; min-width: 240px; background: var(--bg-card); border-right: 1px solid var(--border); transition: all 0.3s cubic-bezier(0.4,0,0.2,1); overflow: hidden; }
    .sidebar.collapsed { width: 64px; min-width: 64px; }
    .sidebar-header { display: flex; align-items: center; gap: 10px; padding: 20px 16px; border-bottom: 1px solid var(--border); overflow: hidden; white-space: nowrap; }
    .logo-icon { font-size: 24px; flex-shrink: 0; }
    .logo-text { font-family: var(--font-display); font-size: 18px; font-weight: 800; background: linear-gradient(135deg,#7C3AED,#06B6D4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .sidebar-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; overflow-x: hidden; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 10px; border-radius: var(--radius-sm); color: var(--text-muted); font-size: 14px; font-weight: 500; transition: var(--transition); white-space: nowrap; overflow: hidden; text-decoration: none; }
    .nav-item:hover { background: var(--bg-elevated); color: var(--text); }
    .nav-item.active { background: rgba(124,58,237,0.15); color: var(--primary-light); }
    .nav-icon { font-size: 18px; flex-shrink: 0; width: 24px; text-align: center; }
    .nav-label { overflow: hidden; text-overflow: ellipsis; }
    .sidebar-footer { padding: 8px; border-top: 1px solid var(--border); }
    .user-item { margin-bottom: 4px; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0; }
    .user-info { display: flex; flex-direction: column; min-width: 0; }
    .user-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text); }
    .user-email { font-size: 11px; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .collapse-btn { width: 100%; padding: 8px; background: var(--bg-elevated); border-radius: 8px; color: var(--text-muted); font-size: 14px; transition: var(--transition); }
    .collapse-btn:hover { background: var(--bg-hover); color: var(--text); }
    .main-content { flex: 1; overflow-y: auto; background: var(--bg); }
    @media (max-width: 768px) {
      .sidebar { position: fixed; z-index: 100; height: 100vh; transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); }
      .main-content { width: 100%; }
    }
  `]
})
export class ShellComponent {
  collapsed = signal(false);

  navItems = [
    { path: '/app/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/app/expenses', icon: '💳', label: 'Expenses' },
    { path: '/app/budget', icon: '🎯', label: 'Budget' },
    { path: '/app/stats', icon: '📊', label: 'Statistics' },
  ];

  constructor(public auth: AuthService, private router: Router) {}
  get user() { return this.auth.user; }
}
