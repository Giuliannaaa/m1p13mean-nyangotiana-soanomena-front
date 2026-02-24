import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user.model';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './user-list.component.html',
    styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
    private userService = inject(UserService);

    users: User[] = [];
    filteredUsers: User[] = [];
    searchTerm: string = '';
    roleFilter: string = 'all';
    isLoading: boolean = true;
    errorMessage: string = '';
    boutiqueUsers: any[] = [];

    ngOnInit(): void {
        this.loadUsers();
        this.loadUserDocuments();
    }

    loadUsers(): void {
        this.isLoading = true;
        this.errorMessage = '';

        forkJoin({
            shops: this.userService.getUserShop(),
            buyers: this.userService.getBuyer(),
            admins: this.userService.getAdmin()
        }).subscribe({
            next: (result: { shops: User[], buyers: User[], admins: User[] }) => {
                this.users = [...result.shops, ...result.buyers, ...result.admins];
                this.applyFilter();
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Error loading users:', err);
                this.errorMessage = 'Erreur lors du chargement des utilisateurs';
                this.isLoading = false;
            }
        });
    }

    applyFilter(): void {
        this.filteredUsers = this.users.filter(user => {
            const matchesRole = this.roleFilter === 'all' || user.role === this.roleFilter;
            const matchesSearch = !this.searchTerm ||
                user.firstname.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                user.lastname.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
            return matchesRole && matchesSearch;
        });
    }

    updateUserState(userId: string): void {
        this.userService.updateUserValidation(userId).subscribe({
            next: () => {
                this.loadUsers();
            },
            error: (err: any) => {
                console.error('Erreur lors de la mise à jour de l\'état de l\'utilisateur:', err);
            }
        });
    }

    loadUserDocuments(): void {
    this.userService.getUserDocuments().subscribe({
        next: (response) => {
        console.log('Documents reçus:', response);
        this.boutiqueUsers = response.data;
        },
        error: (err) => console.error('Erreur documents:', err)
    });
    }

    getDocumentUrl(filePath: string): string {
    return `http://localhost:5000/${filePath.replace('./', '')}`;
    }

    isPdf(filePath: string): boolean {
    return filePath.toLowerCase().endsWith('.pdf');
    }

    // Aperçu modal
    previewUrl: string = '';
    previewVisible: boolean = false;

    openPreview(url: string): void {
    this.previewUrl = url;
    this.previewVisible = true;
    }

    closePreview(): void {
    this.previewUrl = '';
    this.previewVisible = false;
    }
}
