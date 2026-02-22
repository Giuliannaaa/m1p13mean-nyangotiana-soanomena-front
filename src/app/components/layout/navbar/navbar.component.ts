import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  userRole: string = '';
  unreadCount: number = 0;
  menuOpen: boolean = false;
  userMenuOpen: boolean = false;

  // User Info
  userFirstname: string = '';
  userLastname: string = '';
  userEmail: string = '';

  get dashboardLink(): string {
    const role = this.authService.getRole();
    if (role === 'Admin') return '/admin/dashboard';
    if (role === 'Boutique') return '/boutique/dashboard';
    return '/buyer/dashboard';
  }

  ngOnInit(): void {
    this.userRole = this.authService.getRole() || '';
    this.loadUserInfo();
    this.loadUnreadCount();
    
    // Actualiser toutes les 30 secondes
    setInterval(() => {
      this.loadUnreadCount();
    }, 30000);
  }

  loadUserInfo(): void {
    // Récupérer les infos de l'utilisateur depuis le service d'authentification
    // ou depuis localStorage si elles sont sauvegardées
    const user = this.authService.getCurrentUser();
    
    if (user) {
      this.userFirstname = user.firstname || user.firstName || 'Utilisateur';
      this.userLastname = user.lastname || user.lastName || '';
      this.userEmail = user.email || '';
    }
  }

  loadUnreadCount(): void {
    this.messageService.getUnreadCount().subscribe({
      next: (response: any) => {
        this.unreadCount = response.unreadCount || 0;
      },
      error: (err) => {
        console.error('Erreur chargement unreadCount:', err);
      }
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  getUserInitials(): string {
    const first = this.userFirstname.charAt(0).toUpperCase();
    const last = this.userLastname.charAt(0).toUpperCase();
    return first + last || 'U';
  }

  logout(): void {
    this.userMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}