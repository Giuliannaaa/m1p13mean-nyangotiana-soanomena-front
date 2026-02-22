import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { BoutiqueService } from '../../services/boutique/boutique.service';
import { CategorieService } from '../../services/categorie/categorie.service';
import { ProduitService } from '../../services/produits/produits.service';
import { AvisService } from '../../services/avis.service';

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './buyer-dashboard.component.html',
  styleUrl: './buyer-dashboard.component.css'
})
export class BuyerDashboardComponent implements OnInit {
  // Données
  categories: any[] = [];
  newBoutiques: any[] = [];
  bestSellerProducts: any[] = [];
  allProducts: any[] = [];
  activePromotions: any[] = [];
  boutiqueReviews: any[] = [];

  // État
  isLoading: boolean = false;
  selectedCategory: any = null;
  boutiquesByCategory: any[] = [];
  showCategoryModal: boolean = false;

  // RECHERCHE
  searchQuery: string = '';
  searchResults: { boutiques: any[], produits: any[] } = { boutiques: [], produits: [] };
  showSearchResults: boolean = false;

  private dashboardService = inject(DashboardService);
  private boutiqueService = inject(BoutiqueService);
  private categorieService = inject(CategorieService);
  private produitService = inject(ProduitService);
  private avisService = inject(AvisService); 
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadDashboard();
  }

  // CHARGER TOUTES LES DONNÉES DU DASHBOARD
  loadDashboard(): void {
    this.isLoading = true;

    // Charger les catégories
    this.categorieService.getCategories().subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.categories = response;
        } else if (response.data && Array.isArray(response.data)) {
          this.categories = response.data;
        } else if (response.categories && Array.isArray(response.categories)) {
          this.categories = response.categories;
        }
        console.log('Catégories chargées:', this.categories.length);
      },
      error: (err) => console.error('Erreur catégories:', err)
    });

    // Charger les nouvelles boutiques
    this.boutiqueService.getNewBoutiques().subscribe({
      next: (response: any) => {
        this.newBoutiques = response.data || response || [];
        console.log('Nouvelles boutiques chargées:', this.newBoutiques.length);
        console.log('Boutiques avec catégories:', this.newBoutiques.map(b => ({
          name: b.name,
          categoryId: b.categoryId
        })));
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Erreur nouvelles boutiques:', err)
    });

    // Charger les meilleures ventes
    this.dashboardService.getBestSellerProducts().subscribe({
      next: (response: any) => {
        this.bestSellerProducts = response.data || response || [];
        console.log('Best sellers chargés:', this.bestSellerProducts.length);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Erreur best sellers:', err)
    });

    // CHARGER TOUS LES PRODUITS POUR LA RECHERCHE
    this.produitService.getProduits().subscribe({
      next: (response: any) => {
        this.allProducts = response.data || response || [];
        console.log('TOUS les produits chargés:', this.allProducts.length);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Erreur chargement tous produits:', err)
    });

    // Charger les promotions actives
    this.dashboardService.getActivePromotions().subscribe({
      next: (response: any) => {
        this.activePromotions = response.data || response || [];
        //console.log('Promotions chargées:', this.activePromotions);
        //console.log('Première promo:', this.activePromotions[0]); 
        //console.log('Promotions chargées:', this.activePromotions.length);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Erreur promotions:', err)
    });

    // CHARGER LES AVIS - AVEC LE BON SERVICE
    this.avisService.getTousLesAvis().subscribe({
      next: (response: any) => {
        console.log('Réponse avis brute:', response);
        
        let reviews: any[] = [];
        
        if (Array.isArray(response)) {
          reviews = response;
        } else if (response.data && Array.isArray(response.data)) {
          reviews = response.data;
        }
        
        this.boutiqueReviews = reviews.slice(0, 6);
        
        console.log('Avis chargés:', this.boutiqueReviews.length);
        console.log('Avis détails:', this.boutiqueReviews.map(r => ({
          acheteur: r.acheteur_id?.firstname || 'Anonyme',
          boutique: r.boutique_id?.name || 'Inconnue',
          rating: r.rating || r.note,
          comment: r.comment?.substring(0, 30) || r.commentaire?.substring(0, 30) || '...'
        })));
        
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur avis:', err);
        console.log('Tentative avec endpoint alternatif...');
        
        // ESSAYER L'ENDPOINT ALTERNATIF SI LE PREMIER ÉCHOUE
        this.avisService.getTousLesAvisPublic().subscribe({
          next: (response: any) => {
            console.log('Avis chargés (endpoint public):', response.length);
            this.boutiqueReviews = (Array.isArray(response) ? response : response.data || []).slice(0, 6);
            this.cdr.markForCheck();
          },
          error: (err2) => {
            console.error('Erreur avis (endpoint public):', err2);
            this.boutiqueReviews = [];
          }
        });
      }
    });

    this.isLoading = false;
  }

  // RECHERCHE EN TEMPS RÉEL - CHERCHE DANS TOUS LES PRODUITS
  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.showSearchResults = false;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    console.log('Recherche pour:', query);

    // Chercher dans les NOUVELLES BOUTIQUES
    const boutiquesMatches = this.newBoutiques.filter(b => {
      const nom = b.name?.toLowerCase() || '';
      const desc = b.description?.toLowerCase() || '';
      return nom.includes(query) || desc.includes(query);
    });

    console.log('Boutiques trouvées:', boutiquesMatches.length);

    // CHERCHER DANS TOUS LES PRODUITS (pas seulement les best sellers)
    const produitsMatches = this.allProducts.filter(p => {
      const nom = p.nom_prod?.toLowerCase() || '';
      const desc = p.descriptions?.toLowerCase() || '';
      return nom.includes(query) || desc.includes(query);
    });

    console.log('Produits trouvés dans TOUS les produits:', produitsMatches.length);

    this.searchResults = {
      boutiques: boutiquesMatches.slice(0, 5),
      produits: produitsMatches.slice(0, 5)
    };

    this.showSearchResults = true;
    console.log('Total résultats - Boutiques:', this.searchResults.boutiques.length, 'Produits:', this.searchResults.produits.length);
  }

  // EFFACER LA RECHERCHE
  clearSearch(): void {
    this.searchQuery = '';
    this.showSearchResults = false;
  }

  // ALLER À LA PAGE BOUTIQUES AVEC LA RECHERCHE
  goToBoutiquesPage(): void {
    this.router.navigate(['/boutiques'], { 
      queryParams: { search: this.searchQuery } 
    });
  }

  // ALLER À LA PAGE PRODUITS AVEC LA RECHERCHE
  goToProductsPage(): void {
    this.router.navigate(['/produits'], { 
      queryParams: { search: this.searchQuery } 
    });
  }

  // OUVRIR MODAL CATÉGORIE ET CHARGER BOUTIQUES - CORRECTEMENT FILTRÉES
  openCategoryModal(category: any): void {
    this.selectedCategory = category;
    this.showCategoryModal = true;

    console.log('🔍 Catégorie sélectionnée:', category._id, category.nom_cat);
    console.log('📊 Toutes les boutiques disponibles:', this.newBoutiques.length);

    // FILTRER LES BOUTIQUES LOCALEMENT PAR CATÉGORIE
    this.boutiquesByCategory = this.newBoutiques.filter(b => {
      const match = b.categoryId === category._id;
      console.log(`Boutique "${b.name}": categoryId="${b.categoryId}" === "${category._id}" ? ${match}`);
      return match;
    });

    console.log(`Boutiques filtrées pour "${category.nom_cat}":`, this.boutiquesByCategory.length);
    this.boutiquesByCategory.forEach(b => {
      console.log(`  - ${b.name}`);
    });

    this.cdr.markForCheck();
  }

  // FERMER MODAL
  closeCategoryModal(): void {
    this.showCategoryModal = false;
    this.selectedCategory = null;
    this.boutiquesByCategory = [];
  }

  // NAVIGUER VERS LA BOUTIQUE
  viewBoutique(boutiqueId: string): void {
    this.router.navigate(['/boutique', boutiqueId]);
  }

  // NAVIGUER VERS LE PRODUIT
  viewProduct(produitId: string): void {
    this.router.navigate(['/produits', produitId]);
  }

  // AFFICHER LES ÉTOILES
  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }

  // FORMATER LA DATE
  formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // OBTENIR LA COULEUR DE RÉDUCTION
  getDiscountColor(discount: number): string {
    if (discount >= 50) return '#dc3545';
    if (discount >= 30) return '#ff6b6b';
    if (discount >= 10) return '#ffc107';
    return '#28a745';
  }

getBoutiqueFromPromo(promo: any): void {
  // Si on a la boutique directement
  if (promo.boutique_id && typeof promo.boutique_id === 'object') {
    this.viewBoutique(promo.boutique_id._id);
    return;
  }
  
  // Si on a juste l'ID
  if (promo.boutique_id && typeof promo.boutique_id === 'string') {
    this.viewBoutique(promo.boutique_id);
    return;
  }
  
  // Si c'est dans le produit
  if (promo.prod_id && promo.prod_id.store_id) {
    this.viewBoutique(promo.prod_id.store_id);
    return;
  }
  
  console.warn('Impossible de trouver la boutique pour cette promotion', promo);
}
}