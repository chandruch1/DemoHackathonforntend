import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth';
import { LoginRequest } from '../../../core/models/auth.model';
import { getApiErrorMessage } from '../../../core/utils/api-error-message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = signal('');
  password = signal('');
  showPassword = signal(false);
  message = signal('');
  errorMessage = signal('');
  isSubmitting = signal(false);

  constructor(
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  login(): void {
    this.message.set('');
    this.errorMessage.set('');

    const email = this.email();
    const password = this.password();
    if (!email || !password) {
      this.errorMessage.set('Please enter your email and password.');
      return;
    }

    this.isSubmitting.set(true);
    this.authService.login({
      email,
      password
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (this.authService.isAdmin()) {
          void this.router.navigateByUrl(returnUrl && returnUrl.startsWith('/admin') ? returnUrl : '/admin/dashboard');
        } else {
          const safeReturnUrl = returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
            ? returnUrl
            : '/';
          void this.router.navigateByUrl(safeReturnUrl);
        }
      },
      error: error => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error instanceof HttpErrorResponse && error.status === 401
          ? 'The email or password is incorrect.'
          : getApiErrorMessage(error, 'Login failed. Please try again.'));
      }
    });
  }
}