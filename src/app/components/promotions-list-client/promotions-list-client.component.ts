import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PromotionService } from '../../services/promotion/promotion.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-promotions-list-client',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './promotions-list-client.component.html',
  styleUrl: './promotions-list-client.component.css'
})
export class PromotionsListClientComponent implements OnInit {
  promotions: any[] = [];
  filteredPromotions: any[] = [];

  // Filtres
  filtre_type: string = '';
  filtre_statut: string = '';
  isFiltering: boolean = false;

  // Loading
  isLoading: boolean = false;
  userRole: string | null = null;

  constructor(
    private promotionService: PromotionService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRole();
    this.loadPromotions();
  }

  loadPromotions(): void {
    this.isLoading = true;
    this.promotionService.getPromotions().subscribe({
      next: (response: any) => {
        // console.log('Promotions reçues:', response);
        
        // Gérer les deux formats de réponse
        const promosData = Array.isArray(response) ? response : (response.data || []);
        
        this.promotions = promosData.map((promo: any) => ({
          ...promo,
          // Convertir les Decimal128 si nécessaire
          montant: promo.montant?.$numberDecimal 
            ? parseFloat(promo.montant.$numberDecimal) 
            : promo.montant
        }));

        //Filtre
        this.promotions = promosData.map((promo: any) => ({
          ...promo,
          montant: promo.montant?.$numberDecimal 
            ? parseFloat(promo.montant.$numberDecimal) 
            : promo.montant
        }))
        .filter((promo: any) => {
          if (!promo.date_fin) return true;
          return new Date(promo.date_fin) >= new Date();
        });

        // Initialiser le filtre avec toutes les promotions
        this.filteredPromotions = this.promotions;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement promotions:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Filtrer les promotions par type et statut
   */
  filterPromotions(): void {
    this.filteredPromotions = this.promotions.filter(promo => {
      const matchType = !this.filtre_type || promo.type_prom === this.filtre_type;
      
      let matchStatut = true;
      if (this.filtre_statut) {
        if (this.filtre_statut === 'active') {
          matchStatut = promo.est_Active === true;
        } else if (this.filtre_statut === 'expired') {
          matchStatut = promo.est_Active === false;
        }
      }

      return matchType && matchStatut;
    });

    this.isFiltering = this.filtre_type !== '' || this.filtre_statut !== '';
    this.cdr.markForCheck();
  }

  /**
   * Réinitialiser les filtres
   */
  resetFilter(): void {
    this.filtre_type = '';
    this.filtre_statut = '';
    this.filteredPromotions = this.promotions;
    this.isFiltering = false;
    this.cdr.markForCheck();
  }

  /**
   * Récupérer la boutique depuis la promo et naviguer
   * ✅ AVEC GESTION D'ERREUR AMÉLIORÉE
   */
  getBoutiqueFromPromo(promo: any): void {
    console.log('Promotion complète:', promo);
    
    let boutique_id = null;

    // Chercher la boutique par différents chemins
    if (promo.prod_id?.store_id?._id) {
      boutique_id = promo.prod_id.store_id._id;
      console.log('✓ Trouvée via prod_id.store_id._id:', boutique_id);
    } else if (promo.prod_id?.store_id) {
      // Cas où c'est juste un string ID
      boutique_id = promo.prod_id.store_id;
      console.log('✓ Trouvée via prod_id.store_id (string):', boutique_id);
    } else if (promo.store_id?._id) {
      boutique_id = promo.store_id._id;
      console.log('✓ Trouvée via store_id._id:', boutique_id);
    } else if (promo.store_id) {
      // Cas où c'est juste un string ID
      boutique_id = promo.store_id;
      console.log('✓ Trouvée via store_id (string):', boutique_id);
    } else if (promo.boutique_id?._id) {
      boutique_id = promo.boutique_id._id;
      console.log('✓ Trouvée via boutique_id._id:', boutique_id);
    } else if (promo.boutique_id) {
      boutique_id = promo.boutique_id;
      console.log('Trouvée via boutique_id (string):', boutique_id);
    }

    if (boutique_id) {
      console.log('Navigation vers boutique:', boutique_id);
      this.router.navigate(['/boutique', boutique_id]);
    } else {
      console.error('Boutique introuvable. Structure promo:', {
        prod_id: promo.prod_id,
        store_id: promo.store_id,
        boutique_id: promo.boutique_id
      });
      alert('Impossible de trouver la boutique pour cette promotion.\n\nVeuillez contacter le support.');
    }
  }

  /**
   * Formater la date
   */
  formatDate(date: string | Date): string {
    if (!date) return 'Date inconnue';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}