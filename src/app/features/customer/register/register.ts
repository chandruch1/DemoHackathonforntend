import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  fullName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  message = '';
  errorMessage = '';

  register(): void {
    this.message = '';
    this.errorMessage = '';

    if (
      !this.fullName ||
      !this.email ||
      !this.phone ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    const registerRequest = {
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      password: this.password
    };

    console.log(registerRequest);

    this.message = 'Registration UI is ready. API integration is pending.';
  }
}