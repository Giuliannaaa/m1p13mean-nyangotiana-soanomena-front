import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PromotionService } from '../../services/promotion/promotion.service';
import { ProduitService } from '../../services/produits/produits.service';
import { AuthService } from '../../services/auth/auth.service';
import { BoutiqueService } from '../../services/boutique/boutique.service';

@Component({
  selector: 'app-promotion-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './promotion-add.component.html',
  styleUrls: ['./promotion-add.component.css']
})
export class PromotionAddComponent implements OnInit {

  produits: any[] = [];

  newPromotion = {
    prod_id: '',
    type_prom: 'POURCENTAGE',
    montant: null,
    code_promo: '',
    debut: '',
    fin: '',
    est_Active: true
  };

  private authService = inject(AuthService);
  private boutiqueService = inject(BoutiqueService);
  private promotionService = inject(PromotionService);
  private produitService = inject(ProduitService);
  private router = inject(Router);

  isBoutique = false;
  boutiqueId: string | null = null;

  ngOnInit(): void {
    const role = this.authService.getRole();
    this.isBoutique = role === 'Boutique';

    if (this.isBoutique) {
      const userId = this.authService.getUserId();
      if (userId) {
        this.boutiqueService.getBoutiqueByOwner(userId).subscribe({
          next: (boutiques) => {
            if (boutiques && boutiques.length > 0) {
              this.boutiqueId = boutiques[0]._id;
            }
            this.loadProduits();
          },
          error: (err) => {
            console.error('Erreur boutique:', err);
            this.loadProduits();
          }
        });
      } else {
        this.loadProduits();
      }
    } else {
      this.loadProduits();
    }
  }

  loadProduits(): void {
    this.produitService.getProduits().subscribe({
      next: (data) => {
        if (this.isBoutique && this.boutiqueId) {
          this.produits = data.data.filter((p: any) => p.store_id === this.boutiqueId || (p.store_id && p.store_id._id === this.boutiqueId));
        } else {
          this.produits = data.data;
        }
      },
      error: (err) => console.error(err)
    });
  }

  addPromotion(): void {
    if (!this.newPromotion.prod_id || !this.newPromotion.montant) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    this.promotionService.addPromotion(this.newPromotion).subscribe({
      next: () => {
        alert('Promotion ajoutée avec succès 🎉');
        this.router.navigate(['/api/promotions']);
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors de l'ajout de la promotion");
      }
    });
  }
}
