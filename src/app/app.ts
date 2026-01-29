import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  authService = inject(AuthService);
  router = inject(Router); // Inject router
  protected readonly title = signal('m1p13mean-nyangotiana-soanomena-front');

  // Helper to determine if header should be shown
  get showHeader(): boolean {
    const currentUrl = this.router.url;
    // List of auth routes where header should be hidden
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    // Check if current URL starts with any auth route (to handle query params like reset password token)
    const isAuthPage = authRoutes.some(route => currentUrl.startsWith(route));

    return this.authService.isAuthenticated() && !isAuthPage;
  }

  logout() {
    this.authService.logout();
  }
}
