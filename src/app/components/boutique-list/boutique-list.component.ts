import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BoutiqueService } from '../../services/boutique.service';
import { CategorieService } from '../../services/categorie.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-boutique-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule], // ✅ Ajouter FormsModule
    templateUrl: './boutique-list.component.html',
    styleUrl: './boutique-list.component.css'
})
export class BoutiqueListComponent implements OnInit {
    boutiques: any[] = [];
    filteredBoutiques: any[] = []; // ✅ Ajouter les boutiques filtrées
    
    categories: any[] = [];
    users: any[] = [];
    
    // ✅ Variables pour le filtre
    categorie_selectionnee: string = '';
    isFiltering: boolean = false;
    
    isAdmin = false;

    private boutiqueService = inject(BoutiqueService);
    private categorieService = inject(CategorieService);
    private userService = inject(UserService);
    private authService = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);

    ngOnInit(): void {
        this.isAdmin = this.authService.getRole() === 'Admin';
        this.loadCategories();
        this.loadUsers();
        this.loadBoutiques();
    }

    loadCategories(): void {
        this.categorieService.getCategories().subscribe({
            next: (response: any) => {
                console.log('Catégories reçues:', response);
                
                // Extraire le tableau correctement
                if (Array.isArray(response)) {
                    this.categories = response;
                } else if (response && Array.isArray(response.data)) {
                    this.categories = response.data;
                } else if (response && Array.isArray(response.categories)) {
                    this.categories = response.categories;
                } else {
                    this.categories = [];
                }
                
                console.log('Catégories chargées:', this.categories);
            },
            error: (err) => {
                console.error('Erreur chargement catégories:', err);
                this.categories = [];
            }
        });
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
            next: (data: any) => {
                console.log('Données reçues (Boutiques):', data);
                
                if (Array.isArray(data)) {
                    this.boutiques = data;
                } else if (data && data.data && Array.isArray(data.data)) {
                    this.boutiques = data.data;
                } else if (data && data._id) {
                    this.boutiques = [data];
                } else {
                    console.error('Format de données inattendu:', data);
                    this.boutiques = [];
                }
                
                // ✅ Initialiser les boutiques filtrées avec toutes les boutiques
                this.filteredBoutiques = this.boutiques;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Erreur lors du chargement des boutiques', err);
            }
        });
    }

    // ✅ Filtrer les boutiques par catégorie
    filterByCategory(): void {
        if (!this.categorie_selectionnee) {
            // Si aucune catégorie n'est sélectionnée, afficher toutes les boutiques
            this.filteredBoutiques = this.boutiques;
            this.isFiltering = false;
        } else {
            // Filtrer les boutiques localement
            this.filteredBoutiques = this.boutiques.filter(boutique => 
                boutique.categoryId === this.categorie_selectionnee
            );
            this.isFiltering = true;
        }
        
        console.log('Boutiques filtrées:', this.filteredBoutiques.length);
        this.cdr.markForCheck();
    }

    // ✅ Réinitialiser le filtre
    resetFilter(): void {
        this.categorie_selectionnee = '';
        this.filteredBoutiques = this.boutiques;
        this.isFiltering = false;
        this.cdr.markForCheck();
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