import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { MessageService } from '../../../services/message.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
    authService = inject(AuthService);
    messageService = inject(MessageService);

    unreadCount: number = 0; // 

    ngOnInit(): void { // 
        this.loadUnreadCount();

        // Actualiser toutes les 30 secondes
        setInterval(() => {
            this.loadUnreadCount();
        }, 30000);
    }

    // 
    loadUnreadCount(): void {
        this.messageService.getUnreadCount().subscribe({
            next: (response: any) => {
                this.unreadCount = response.unreadCount || 0;
            },
            error: (err) => {
                console.error('Erreur chargement non-lus:', err);
            }
        });
    }

    logout() {
        this.authService.logout();
    }
}