import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UpdateCustomerProfileRequest,
  ChangePasswordRequest
} from '../../../core/models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {

  // Temporary mock profile data
  fullName = 'Customer Name';
  email = 'customer@example.com';
  phone = '9876543210';

  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  message = '';
  errorMessage = '';

  updateProfile(): void {

    const request: UpdateCustomerProfileRequest = {
      fullName: this.fullName,
      phone: this.phone
    };

    console.log('Update Profile Request:', request);

    this.message = 'Profile details are ready to update.';
    this.errorMessage = '';
  }

  changePassword(): void {

    if (this.newPassword !== this.confirmNewPassword) {
      this.errorMessage = 'New passwords do not match.';
      this.message = '';
      return;
    }

    const request: ChangePasswordRequest = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmNewPassword: this.confirmNewPassword
    };

    console.log('Change Password Request:', request);

    this.message = 'Password request is ready.';
    this.errorMessage = '';
  }
}