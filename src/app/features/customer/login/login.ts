import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
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

  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  email = '';
  password = '';
  showPassword = false;

  isLoading = false;
  errorMessage = '';

  login(): void {
    this.errorMessage = '';
    if (this.isLoading) {
      return;
    }

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    const loginRequest: LoginRequest = {
      email: this.email.trim(),
      password: this.password
    };

    this.isLoading = true;
    this.authService.login(loginRequest).subscribe({
      next: response => {
        this.isLoading = false;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

        if (response.user.role === 'Admin') {
          void this.router.navigateByUrl(
            returnUrl?.startsWith('/admin') ? returnUrl : '/admin/dashboard'
          );
          return;
        }

        const safeReturnUrl = returnUrl?.startsWith('/') &&
          !returnUrl.startsWith('//') &&
          !returnUrl.startsWith('/\\') &&
          !returnUrl.startsWith('/admin')
          ? returnUrl
          : '/';
        void this.router.navigateByUrl(safeReturnUrl);
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage = error instanceof HttpErrorResponse && error.status === 401
          ? 'The email or password is incorrect.'
          : getApiErrorMessage(error, 'Login failed. Please try again.');
      }
    });
  }
}