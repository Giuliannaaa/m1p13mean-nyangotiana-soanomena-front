import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BoutiqueService } from '../../services/boutique.service';
import { CategorieService } from '../../services/categorie.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-boutique-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './boutique-list.component.html',
    styleUrl: './boutique-list.component.css'
})
export class BoutiqueListComponent implements OnInit {
    boutiques: any[] = [];
    categories: any[] = [];
    users: any[] = [];
    isAdmin = false;

    private boutiqueService = inject(BoutiqueService);
    private categorieService = inject(CategorieService);
    private userService = inject(UserService);
    private authService = inject(AuthService);

    ngOnInit(): void {
        this.isAdmin = this.authService.getRole() === 'Admin';
        this.loadCategories();
        this.loadUsers();
        this.loadBoutiques();
    }

    loadCategories(): void {
        this.categorieService.getCategories().subscribe(data => this.categories = data);
    }

    loadUsers(): void {
        this.userService.getUserShop().subscribe(data => this.users = data);
    }

    getCategoryName(id: string | undefined): string {
        if (!id) return 'N/A';
        const cat = this.categories.find(c => c._id === id);
        return cat ? cat.nom_cat : 'N/A';
    }

    getOwnerName(id: string | undefined): string {
        if (!id) return 'N/A';
        const user = this.users.find(u => u._id === id);
        return user ? `${user.firstname} ${user.lastname}` : 'N/A';
    }

    loadBoutiques(): void {
        this.boutiqueService.getAllBoutiques().subscribe({
            next: (data) => {
                this.boutiques = data;
                // console.log('boutiques:', this.boutiques);
            },
            error: (err) => {
                console.error('Erreur lors du chargement des boutiques', err);
            }
        });
    }

    deleteBoutique(id: string): void {
        if (confirm('Voulez-vous vraiment supprimer cette boutique ?')) {
            this.boutiqueService.deleteBoutique(id).subscribe({
                next: () => {
                    this.loadBoutiques();
                },
                error: (err) => {
                    console.error('Erreur lors de la suppression', err);
                }
            });
        }
    }
    validateBoutique(id: string, isValidated: boolean): void {
        if (confirm('Voulez-vous vraiment ' + (isValidated ? 'désactiver' : 'activer') + ' cette boutique ?')) {
            this.boutiqueService.validateBoutique(id, isValidated).subscribe({
                next: () => {
                    this.loadBoutiques();
                },
                error: (err) => {
                    console.error('Erreur lors de la validation', err);
                }
            });
        }
    }
}
