import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { MessageService } from "../../../services/message.service";

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
    authService = inject(AuthService);

    get dashboardLink(): string {
        const role = this.authService.getRole();
        if (role === 'Boutique') return '/boutique/dashboard';
        return '/buyer/dashboard';
    }

    messageService = inject(MessageService);

    userRole: string = '';
    unreadCount: number = 0;

    ngOnInit(): void {
        this.userRole = this.authService.getRole() || '';
        this.loadUnreadCount();
        
        // Actualiser toutes les 30 secondes
        setInterval(() => {
        this.loadUnreadCount();
        }, 30000);
    }

    loadUnreadCount(): void {
        this.messageService.getUnreadCount().subscribe({
        next: (response: any) => {
            this.unreadCount = response.unreadCount || 0;
        }
        });
    }

    logout() {
        this.authService.logout();
    }
}
