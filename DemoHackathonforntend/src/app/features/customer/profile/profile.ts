import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UpdateCustomerProfileRequest,
  ChangePasswordRequest
} from '../../../core/models/auth.model';
import { AuthService } from '../../../core/auth/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private readonly authService = inject(AuthService);

  fullName = signal('');
  email = signal('');
  phone = signal('');

  currentPassword = signal('');
  newPassword = signal('');
  confirmNewPassword = signal('');

  message = signal('');
  errorMessage = signal('');

  passwordMessage = signal('');
  passwordErrorMessage = signal('');

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.fullName.set(user.fullName);
      this.email.set(user.email);
      this.phone.set(user.phone || '');
    }

    this.authService.getCurrentUser().subscribe({
      next: u => {
        this.fullName.set(u.fullName);
        this.email.set(u.email);
        this.phone.set(u.phone || '');
      }
    });
  }

  updateProfile(): void {
    this.message.set('');
    this.errorMessage.set('');

    if (!this.fullName().trim()) {
      this.errorMessage.set('Please enter your full name.');
      return;
    }

    const request: UpdateCustomerProfileRequest = {
      fullName: this.fullName().trim(),
      phone: this.phone().trim()
    };

    this.authService.updateProfile(request).subscribe({
      next: () => {
        this.message.set('Profile details updated successfully!');
      },
      error: err => {
        this.errorMessage.set(err?.error?.message || 'Failed to update profile.');
      }
    });
  }

  changePassword(): void {
    this.message.set('');
    this.errorMessage.set('');

    const currentPassword = this.currentPassword();
    const newPassword = this.newPassword();
    const confirmNewPassword = this.confirmNewPassword();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      this.errorMessage.set('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      this.errorMessage.set('New passwords do not match.');
      return;
    }

    const request: ChangePasswordRequest = {
      currentPassword,
      newPassword,
      confirmNewPassword
    };

    this.authService.changePassword(request).subscribe({
      next: () => {
        this.message.set('Password changed successfully.');
        this.currentPassword.set('');
        this.newPassword.set('');
        this.confirmNewPassword.set('');
      },
      error: err => {
        this.errorMessage.set(err?.error?.message || 'Failed to change password.');
      }
    });
  }
}
