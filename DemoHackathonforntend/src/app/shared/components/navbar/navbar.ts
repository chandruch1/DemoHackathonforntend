<<<<<<< HEAD
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
=======
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
import { AuthService } from '../../../core/auth/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
<<<<<<< HEAD
  constructor(readonly authService: AuthService) {}

  logout(): void {
    this.authService.logout();
=======

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly currentUser = this.authService.currentUser;

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/']);
>>>>>>> 73bdac2022968348a69bbae339adc0bfa8c4ae79
  }
}