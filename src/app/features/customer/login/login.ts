import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';
  showPassword = false;

  message = '';

  login(): void {
    if (!this.email || !this.password) {
      this.message = 'Please enter your email and password.';
      return;
    }

    const loginRequest = {
      email: this.email,
      password: this.password
    };

    console.log(loginRequest);

    this.message = 'Login UI is ready. API integration is pending.';
  }
}