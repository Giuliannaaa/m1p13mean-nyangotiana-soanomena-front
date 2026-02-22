import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CategorieService } from '../../services/categorie/categorie.service';
import { BoutiqueService } from '../../services/boutique/boutique.service';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-categorie-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './categorie-list.component.html',
  styleUrl: './categorie-list.component.css',
})
export class CategorieListComponent implements OnInit {
  categories: any[] = [];
  filteredCategories: any[] = [];
  shopsByCategory: any[] = [];
  selectedCategory: any = null;
  searchText: string = '';
  isAdmin = false;
  isAcheteur = false;

  private categorieService = inject(CategorieService);
  private boutiqueService = inject(BoutiqueService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.isAdmin = this.authService.getRole() === 'Admin';
    this.isAcheteur = this.authService.getRole() === 'Acheteur';
    this.loadCategories();
  }

  loadCategories(): void {
    this.categorieService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.filteredCategories = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories:', err);
      }
    });
  }

  filterCategories(): void {
    const searchLower = this.searchText.toLowerCase();
    this.filteredCategories = this.categories.filter(cat =>
      cat.nom_cat.toLowerCase().includes(searchLower) ||
      (cat.descriptions && cat.descriptions.toLowerCase().includes(searchLower))
    );
    this.cdr.markForCheck();
  }

  selectCategory(category: any): void {
    this.selectedCategory = category;
    this.loadShopsByCategory(category._id);
  }

  loadShopsByCategory(categoryId: string): void {
    // Récupérer toutes les boutiques et filtrer par catégorie
    this.boutiqueService.getAllBoutiques().subscribe({
      next: (response: any) => {
        const allBoutiques = Array.isArray(response) ? response : (response.data || []);
        // Filtrer les boutiques qui ont cette catégorie
        this.shopsByCategory = allBoutiques.filter((boutique: any) =>
          boutique.categoryId === categoryId || boutique.categoryId?._id === categoryId
        );
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des boutiques:', err);
        this.shopsByCategory = [];
      }
    });
  }

  deleteCategorie(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      this.categorieService.deleteCategorie(id).subscribe({
        next: () => {
          alert('Catégorie supprimée avec succès');
          this.loadCategories();
          if (this.selectedCategory?._id === id) {
            this.selectedCategory = null;
            this.shopsByCategory = [];
          }
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  viewBoutique(boutiqueId: string): void {
    this.router.navigate(['/boutiques', boutiqueId]);
  }

  validateBoutique(boutiqueId: string, currentStatus: boolean): void {
    const newStatus = !currentStatus;
    this.boutiqueService.updateBoutique(boutiqueId, { isValidated: newStatus }).subscribe({
      next: () => {
        alert(newStatus ? 'Boutique activée' : 'Boutique désactivée');
        this.loadShopsByCategory(this.selectedCategory._id);
      },
      error: (err) => {
        console.error('Erreur validation:', err);
        alert('Erreur lors de la modification');
      }
    });
  }

  getOwnerName(ownerId: string): string {
    // Retourne "Non spécifié" si pas de propriétaire
    // Dans une vraie app, faire un appel API pour récupérer les infos
    return 'Propriétaire';
  }

  getCategoryName(categoryId: string | any): string {
    if (!categoryId) return '';
    // Si c'est un objet avec _id, retourner le nom
    if (typeof categoryId === 'object' && categoryId.nom_cat) {
      return categoryId.nom_cat;
    }
    // Si c'est juste un ID, chercher dans les catégories
    const cat = this.categories.find(c => c._id === categoryId);
    return cat ? cat.nom_cat : '';
  }

  deleteBoutique(boutiqueId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
      this.boutiqueService.deleteBoutique(boutiqueId).subscribe({
        next: () => {
          alert('Boutique supprimée avec succès');
          if (this.selectedCategory) {
            this.loadShopsByCategory(this.selectedCategory._id);
          }
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  toggleSuivreBoutique(boutiqueId: string): void {
    if (this.isBoutiqueSuivie(boutiqueId)) {
      // Arrêter de suivre
      console.log('Arrêt de suivi boutique:', boutiqueId);
    } else {
      // Commencer à suivre
      console.log('Suivi boutique:', boutiqueId);
    }
  }

  isBoutiqueSuivie(boutiqueId: string): boolean {
    // TODO: Implémenter la logique de suivi des boutiques
    // Pour maintenant, retourner false
    return false;
  }
}