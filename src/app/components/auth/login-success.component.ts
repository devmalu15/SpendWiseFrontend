import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-success',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center">
      <div class="text-xs font-bold uppercase tracking-[0.3em] animate-pulse">Authenticating...</div>
    </div>
  `
})
export class LoginSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.auth.login({
          token: params['token'],
          email: params['email'],
          userId: params['userId'],
          fullName: decodeURIComponent(params['fullName'] || ''),
          avatarColor: decodeURIComponent(params['avatarColor'] || '#000000'),
          currency: params['currency'] || 'INR',
          expiry: ''
        });
        this.router.navigate(['/app']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
