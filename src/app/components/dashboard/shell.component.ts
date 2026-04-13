import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex flex-col md:flex-row min-h-screen bg-bg text-text">
      <!-- Mobile Header -->
      <header class="md:hidden flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-bg z-50">
        <div class="text-lg font-black tracking-tighter uppercase">SPENDWISE</div>
        <button (click)="mobileMenuOpen.set(!mobileMenuOpen())" class="p-2">
          <span class="material-icons">{{ mobileMenuOpen() ? 'close' : 'menu' }}</span>
        </button>
      </header>

      <!-- Sidebar -->
      <aside 
        [class.translate-x-0]="mobileMenuOpen()" 
        [class.-translate-x-full]="!mobileMenuOpen()"
        class="fixed inset-0 z-40 md:relative md:translate-x-0 w-full md:w-64 bg-bg border-r border-border flex flex-col transition-transform duration-300 ease-in-out"
      >
        <div class="hidden md:flex items-center px-8 py-10">
          <div class="text-xl font-black tracking-tighter uppercase">SPENDWISE</div>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-2">
          @for (item of navItems; track item.path) {
            <a 
              [routerLink]="item.path" 
              routerLinkActive="bg-neutral-100 dark:bg-neutral-900 font-bold" 
              (click)="mobileMenuOpen.set(false)"
              class="flex items-center gap-4 px-4 py-3 text-sm uppercase tracking-widest hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors"
            >
              <span class="material-icons text-dim">{{ item.icon }}</span>
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="p-4 border-t border-border">
          <a 
            routerLink="/app/profile" 
            routerLinkActive="bg-neutral-100 dark:bg-neutral-900"
            (click)="mobileMenuOpen.set(false)"
            class="flex items-center gap-4 px-4 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors"
          >
            <div class="w-8 h-8 flex items-center justify-center bg-text text-bg font-bold text-xs">
              {{ user()?.fullName?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold truncate uppercase tracking-wider">{{ user()?.fullName }}</div>
              <div class="text-[10px] text-dim truncate uppercase tracking-tighter">{{ user()?.email }}</div>
            </div>
          </a>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-6xl mx-auto">
          <router-outlet />
        </div>
      </main>
    </div>
  `
})
export class ShellComponent {
  public auth = inject(AuthService);
  mobileMenuOpen = signal(false);

  navItems = [
    { path: '/app/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/app/expenses', icon: 'payments', label: 'Expenses' },
    { path: '/app/budget', icon: 'track_changes', label: 'Budget' },
    { path: '/app/stats', icon: 'bar_chart', label: 'Stats' },
  ];

  get user() { return this.auth.user; }
}
