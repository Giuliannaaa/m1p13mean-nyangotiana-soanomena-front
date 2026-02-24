import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
    authService = inject(AuthService);
    notificationService = inject(NotificationService);
    private destroy$ = new Subject<void>();

    unreadMessages: number = 0;
    unreadSignalements: number = 0;

    ngOnInit(): void {
    // Charger les notifications au démarrage
    this.notificationService.loadAllNotifications(); // ← ajoute cette ligne

    this.notificationService.unreadMessages$
        .pipe(takeUntil(this.destroy$))
        .subscribe(count => this.unreadMessages = count);

    this.notificationService.unreadSignalements$
        .pipe(takeUntil(this.destroy$))
        .subscribe(count => this.unreadSignalements = count);

    // Actualiser toutes les 30 secondes
    const refreshInterval = setInterval(() => {
        this.notificationService.loadAllNotifications();
    }, 30000);

    this.destroy$.subscribe(() => clearInterval(refreshInterval));
}

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
    

    logout() {
        this.authService.logout();
    }
}