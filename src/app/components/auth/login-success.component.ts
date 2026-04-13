import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-success',
  standalone: true,
  template: `<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:var(--text-muted)">Signing you in...</div>`
})
export class LoginSuccessComponent implements OnInit {
  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.auth.login({
          token: params['token'],
          email: params['email'],
          userId: params['userId'],
          fullName: decodeURIComponent(params['fullName'] || ''),
          avatarColor: decodeURIComponent(params['avatarColor'] || '#6C63FF'),
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
