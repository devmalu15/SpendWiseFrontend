import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex flex-col">
      <nav class="flex items-center justify-between px-8 py-6 border-b border-border">
        <div class="text-xl font-bold tracking-tighter">SPENDWISE</div>
        <a routerLink="/login" class="btn btn-primary">GET STARTED</a>
      </nav>

      <main class="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div class="max-w-2xl">
          <h1 class="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-none">
            TRACK YOUR <span class="money-pos">MONEY</span> SIMPLY.
          </h1>
          <p class="text-lg md:text-xl text-muted mb-12 font-medium">
            A minimalist approach to personal finance. No clutter, just your numbers.
          </p>
          <div class="flex flex-col md:flex-row gap-4 justify-center">
            <a routerLink="/login" class="btn btn-primary px-12 py-4 text-lg">START NOW</a>
            <a routerLink="/login" class="btn btn-ghost px-12 py-4 text-lg">LOG IN</a>
          </div>
        </div>
      </main>

      <footer class="px-8 py-12 border-t border-border">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          <div>
            <div class="text-xs font-bold uppercase tracking-widest text-muted mb-4">01 / ANALYTICS</div>
            <p class="text-sm font-medium">Clear insights into your spending habits without the noise.</p>
          </div>
          <div>
            <div class="text-xs font-bold uppercase tracking-widest text-muted mb-4">02 / BUDGETING</div>
            <p class="text-sm font-medium">Set limits and stay within them. Simple as that.</p>
          </div>
          <div>
            <div class="text-xs font-bold uppercase tracking-widest text-muted mb-4">03 / SECURITY</div>
            <p class="text-sm font-medium">Your data is yours. Secure and private by design.</p>
          </div>
        </div>
        <div class="mt-16 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-dim">
          © 2026 SPENDWISE / MINIMALIST FINANCE
        </div>
      </footer>
    </div>
  `
})
export class LandingComponent {}
