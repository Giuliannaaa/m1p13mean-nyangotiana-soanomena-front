import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SuiviService } from '../../services/suivi.service';
import { BoutiqueService } from '../../services/boutique/boutique.service';
import { CategorieService } from '../../services/categorie/categorie.service';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-mes-suivis',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mes-suivis.component.html',
  styleUrl: './mes-suivis.component.css'
})
export class MesSuivisComponent implements OnInit {
  boutiques: any[] = [];
  filteredBoutiques: any[] = [];

  categories: any[] = [];
  users: any[] = [];

  searchText: string = '';
  categorie_selectionnee: string = '';
  isFiltering: boolean = false;
  isLoading: boolean = false;

  private suiviService = inject(SuiviService);
  private boutiqueService = inject(BoutiqueService);
  private categorieService = inject(CategorieService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadMesSuivis();
    this.loadCategories();
    this.loadUsers();
  }

  loadMesSuivis(): void {
    this.isLoading = true;
    this.suiviService.getMesSuivis().subscribe({
      next: (response: any) => {
        console.log('Mes suivis reçus:', response);

        // Extraire les IDs des boutiques
        const boutiqueIds = response.data?.map((suivi: any) => suivi.boutique_id._id) || [];

        // Charger les détails complets des boutiques
        this.boutiqueService.getAllBoutiques().subscribe({
          next: (boutiques: any) => {
            // Filtrer pour n'afficher que les boutiques suivies
            const allBoutiques = boutiques.data || boutiques;
            this.boutiques = allBoutiques.filter((b: any) =>
              boutiqueIds.includes(b._id)
            );
            this.filteredBoutiques = this.boutiques;
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Erreur chargement boutiques:', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Erreur chargement mes suivis:', err);
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.categorieService.getCategories().subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.categories = response;
        } else if (response && Array.isArray(response.data)) {
          this.categories = response.data;
        } else if (response && Array.isArray(response.categories)) {
          this.categories = response.categories;
        } else {
          this.categories = [];
        }
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

  // Filtrer les boutiques
  filterBoutiques(): void {
    this.filteredBoutiques = this.boutiques.filter(boutique => {
      const matchCategory = !this.categorie_selectionnee ||
        boutique.categoryId === this.categorie_selectionnee;

      const searchLower = this.searchText.toLowerCase();
      const matchSearch = !this.searchText ||
        boutique.name.toLowerCase().includes(searchLower) ||
        (boutique.description && boutique.description.toLowerCase().includes(searchLower));

      return matchCategory && matchSearch;
    });

    this.isFiltering = this.categorie_selectionnee !== '' || this.searchText !== '';
    this.cdr.markForCheck();
  }

  // Réinitialiser les filtres
  resetFilter(): void {
    this.searchText = '';
    this.categorie_selectionnee = '';
    this.filteredBoutiques = this.boutiques;
    this.isFiltering = false;
    this.cdr.markForCheck();
  }

  // Arrêter de suivre une boutique
  arreterSuivreBoutique(boutiqueId: string): void {
    if (confirm('Êtes-vous sûr de vouloir arrêter de suivre cette boutique ?')) {
      this.suiviService.arreterSuivreBoutique(boutiqueId).subscribe({
        next: () => {
          alert('Vous avez arrêté de suivre cette boutique');
          this.loadMesSuivis();
        },
        error: (err) => {
          console.error('Erreur arrêt suivi:', err);
          alert('Erreur lors de l\'arrêt du suivi');
        }
      });
    }
  }
}