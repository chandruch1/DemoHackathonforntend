import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth';
import { RegisterCustomerRequest } from '../../../core/models/auth.model';
import { getApiErrorMessage } from '../../../core/utils/api-error-message';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private readonly authService = inject(AuthService);

  fullName = signal('');
  email = signal('');
  phone = signal('');
  password = signal('');
  confirmPassword = signal('');
  showPassword = signal(false);
  message = signal('');
  errorMessage = signal('');
  isSubmitting = signal(false);

  register(): void {
    this.message.set('');
    this.errorMessage.set('');
    if (this.isSubmitting()) return;

    const fullName = this.fullName().trim();
    const email = this.email().trim();
    const phone = this.phone().trim();
    const password = this.password();
    const confirmPassword = this.confirmPassword();
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      this.errorMessage.set('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    const request: RegisterCustomerRequest = {
      fullName,
      email,
      phone,
      password,
      confirmPassword
    };

    this.isSubmitting.set(true);
    this.authService.register(request).subscribe({
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
        this.errorMessage.set(getApiErrorMessage(error, 'Registration failed. Please try again.'));
      }
    });
  }
}
