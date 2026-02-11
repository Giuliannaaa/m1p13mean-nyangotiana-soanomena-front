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
    filtre_special: string = 'tous';
    searchText: string = '';
    isFiltering: boolean = false;
    
    isAdmin = false;

    private boutiqueService = inject(BoutiqueService);
    private categorieService = inject(CategorieService);
    private userService = inject(UserService);
    private authService = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);

    ngOnInit(): void {
        this.isAdmin = this.authService.getRole() === 'Admin';
        this.isAcheteur = this.authService.getRole() === 'Acheteur';
        
        this.loadCategories();
        this.loadUsers();
        this.loadBoutiques();

        // ÉCOUTER LES CHANGEMENTS DU SERVICE
        if (this.isAcheteur) {
            this.suiviService.getBoutiquesSuivies().subscribe(ids => {
                this.boutiquesSuivies = ids;
                console.log('Boutiques suivies mises à jour:', ids);
                this.cdr.markForCheck();
            });
        }
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

    // CHARGER LES BOUTIQUES SPÉCIALES
    loadSpecialBoutiques(): void {
        this.isLoadingSpecial = true;
        console.log('Filtre spécial boutique:', this.filtre_special);
        
        let request$;
        
        switch(this.filtre_special) {
            case 'nouveau':
                request$ = this.boutiqueService.getNewBoutiques();
                break;
            case 'populaire':
                request$ = this.boutiqueService.getPopularBoutiques();
                break;
            case 'featured':
                request$ = this.boutiqueService.getFeaturedBoutiques();
                break;
            case 'top-rated':
                request$ = this.boutiqueService.getTopRatedBoutiques();
                break;
            default:
                this.loadBoutiques();
                return;
        }
        
        request$.subscribe({
            next: (response: any) => {
                console.log('Boutiques spéciales reçues:', response);
                this.boutiques = response.data || response;
                this.filterBoutiques();
                this.isLoadingSpecial = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Erreur chargement boutiques spéciales:', err);
                this.isLoadingSpecial = false;
            }
        });
    }

    // FILTRER LES BOUTIQUES
    filterBoutiques(): void {
        if (this.filtre_special !== 'tous') {
            this.loadSpecialBoutiques();
            return;
        }
        
        this.filteredBoutiques = this.boutiques.filter(boutique => {
            const matchCategory = !this.categorie_selectionnee || 
                boutique.categoryId === this.categorie_selectionnee;
            
            const searchLower = this.searchText.toLowerCase();
            const ownerName = this.getOwnerName(boutique.ownerId).toLowerCase();
            
            const matchSearch = !this.searchText || 
                boutique.name.toLowerCase().includes(searchLower) ||
                (boutique.description && boutique.description.toLowerCase().includes(searchLower)) ||
                ownerName.includes(searchLower);
            
            return matchCategory && matchSearch;
        });
        
        console.log('Boutiques filtrées:', this.filteredBoutiques.length);
        this.cdr.markForCheck();
    }

    // ✅ Réinitialiser le filtre
    resetFilter(): void {
        this.categorie_selectionnee = '';
        this.filtre_special = 'tous';
        this.searchText = '';
        this.loadBoutiques();
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

    // SUIVRE/ARRÊTER - LAISSER LE SERVICE GÉRER LA MISE À JOUR
    toggleSuivreBoutique(boutiqueId: string | undefined): void {
        if (!boutiqueId) {
            alert('ID de la boutique manquant');
            return;
        }

        if (this.boutiquesSuivies.includes(boutiqueId)) {
            // Arrêter de suivre
            this.suiviService.arreterSuivreBoutique(boutiqueId).subscribe({
                next: () => {
                    alert('Vous ne suivez plus cette boutique');
                    // Le service met à jour automatiquement boutiquesSuivies$
                },
                error: (err) => {
                    console.error('Erreur arrêt suivi:', err);
                    alert('Erreur lors de l\'arrêt du suivi');
                }
            });
        } else {
            // Suivre
            this.suiviService.suivreBoutique(boutiqueId).subscribe({
                next: () => {
                    alert('Vous suivez maintenant cette boutique !');
                    // Le service met à jour automatiquement boutiquesSuivies$
                },
                error: (err) => {
                    console.error('Erreur suivi:', err);
                    alert('Erreur lors du suivi de la boutique');
                }
            });
        }
    }

    // VÉRIFIER SI UNE BOUTIQUE EST SUIVIE
    isBoutiqueSuivie(boutiqueId: string | undefined): boolean {
        return boutiqueId ? this.boutiquesSuivies.includes(boutiqueId) : false;
    }
}