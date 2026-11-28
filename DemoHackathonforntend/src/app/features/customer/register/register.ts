<<<<<<< HEAD
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth';
import { getApiErrorMessage } from '../../../core/models/api-error';
import { RegisterCustomerRequest } from '../../../core/models/auth.model';
=======
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth';
import { RegisterCustomerRequest } from '../../../core/models/auth.model';
import { getApiErrorMessage } from '../../../core/utils/api-error-message';
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

<<<<<<< HEAD
  fullName = signal('');
  email = signal('');
  phone = signal('');
  password = signal('');
  confirmPassword = signal('');

  showPassword = signal(false);
  message = signal('');
  errorMessage = signal('');
  isSubmitting = signal(false);

  constructor(private readonly authService: AuthService) {}

  register(): void {
    this.message.set('');
    this.errorMessage.set('');
=======
  private authService = inject(AuthService);
  private router = inject(Router);

  fullName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  isLoading = false;

  message = '';
  errorMessage = '';

  register(): void {

    this.message = '';
    this.errorMessage = '';
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79

    const fullName = this.fullName();
    const email = this.email();
    const phone = this.phone();
    const password = this.password();
    const confirmPassword = this.confirmPassword();
    if (
      !fullName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      this.errorMessage.set('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

<<<<<<< HEAD
    const registerRequest: RegisterCustomerRequest = {
      fullName,
      email,
      phone,
      password,
      confirmPassword
    };

    this.isSubmitting.set(true);
    this.authService.register(registerRequest).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.message.set('Your account was created. You can now log in.');
        this.fullName.set('');
        this.email.set('');
        this.phone.set('');
        this.password.set('');
        this.confirmPassword.set('');
      },
      error: error => {
        this.isSubmitting.set(false);
        this.errorMessage.set(getApiErrorMessage(error));
=======
    const request: RegisterCustomerRequest = {
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      password: this.password,
      confirmPassword: this.confirmPassword
    };

    this.isLoading = true;

    this.authService.register(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.message = 'Registration successful! Redirecting to login...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },

      error: error => {
        this.isLoading = false;
        this.errorMessage = getApiErrorMessage(
          error,
          'Registration failed. Please try again.'
        );
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
      }
    });
  }
}