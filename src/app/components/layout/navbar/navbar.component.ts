import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { MessageService } from '../../../services/message.service';
import { NotificationService } from '../../../services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  userRole: string = '';
  menuOpen: boolean = false;
  userMenuOpen: boolean = false;

  // User Info
  userFirstname: string = '';
  userLastname: string = '';
  userEmail: string = '';

  // Notifications
  unreadMessages: number = 0;
  unreadAchats: number = 0;
  unreadSignalements: number = 0;
  totalNotifications: number = 0;

  get dashboardLink(): string {
    const role = this.authService.getRole();
    if (role === 'Admin') return '/admin/dashboard';
    if (role === 'Boutique') return '/boutique/dashboard';
    return '/buyer/dashboard';
  }

  ngOnInit(): void {
    this.userRole = this.authService.getRole() || '';
    this.loadUserInfo();
    
    // Charger toutes les notifications au démarrage
    this.notificationService.loadAllNotifications();
    
    // S'abonner aux changements de notifications
    this.notificationService.unreadMessages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadMessages = count;
      });

    this.notificationService.unreadAchats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadAchats = count;
      });

    this.notificationService.unreadSignalements$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadSignalements = count;
      });

    this.notificationService.totalNotifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalNotifications = count;
      });

    // Actualiser les notifications toutes les 30 secondes
    const refreshInterval = setInterval(() => {
      this.notificationService.loadAllNotifications();
    }, 30000);

    // Nettoyer l'interval quand le component est destroyed
    this.destroy$.subscribe(() => {
      clearInterval(refreshInterval);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserInfo(): void {
    const user = this.authService.getCurrentUser();
    
    if (user) {
      this.userFirstname = user.firstname || user.firstName || 'Utilisateur';
      this.userLastname = user.lastname || user.lastName || '';
      this.userEmail = user.email || '';
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      this.userMenuOpen = false;
    }
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) {
      this.menuOpen = false;
    }
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  getUserInitials(): string {
    const first = this.userFirstname.charAt(0).toUpperCase();
    const last = this.userLastname.charAt(0).toUpperCase();
    return first + last || 'U';
  }

  /**
   * Aller au lien et réinitialiser la notification
   */
  navigateAndResetNotification(path: string, notificationType: 'messages' | 'achats' | 'signalements'): void {
    this.router.navigate([path]);
    this.closeMenu();
    
    // Réinitialiser le compteur du type de notification
    if (notificationType === 'messages') {
      this.notificationService['unreadMessagesSubject'].next(0);
    } else if (notificationType === 'achats') {
      this.notificationService['unreadAchatsSubject'].next(0);
    } else if (notificationType === 'signalements') {
      this.notificationService['unreadSignalementsSubject'].next(0);
    }
  }

  logout(): void {
    this.userMenuOpen = false;
    this.notificationService.resetNotifications();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}