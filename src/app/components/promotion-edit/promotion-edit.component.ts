import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PromotionService } from '../../services/promotion/promotion.service';
import { ProduitService } from '../../services/produits/produits.service';
import { AuthService } from '../../services/auth/auth.service';
import { BoutiqueService } from '../../services/boutique/boutique.service';

@Component({
  selector: 'app-promotion-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './promotion-edit.component.html',
  styleUrls: ['./promotion-edit.component.css'],
})
export class PromotionEditComponent implements OnInit {

  promotionId!: string;
  produits: any[] = [];

  promotion = {
    prod_id: '',
    type_prom: 'POURCENTAGE',
    montant: 0,
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
  private route = inject(ActivatedRoute);

  isBoutique = false;
  boutiqueId: string | null = null;

  ngOnInit(): void {
    this.promotionId = this.route.snapshot.paramMap.get('id')!;
    const role = this.authService.getRole();
    if (role !== 'Admin') {
      this.router.navigate(['/login']);
      return;
    }
    this.loadProduits();
    this.loadPromotion();
  }

  loadProduits(): void {
    this.produitService.getProduits().subscribe(data => {
      this.produits = data.data;
    });
  }

  loadPromotion(): void {
    this.promotionService.getPromotionById(this.promotionId).subscribe(data => {
      // console.log('Données reçues:', data);

      this.promotion = {
        ...data,
        prod_id: data.prod_id?._id || data.prod_id,
        montant: data.montant?.$numberDecimal
          ? parseFloat(data.montant.$numberDecimal)
          : (typeof data.montant === 'number' ? data.montant : 0),
        debut: data.debut?.substring(0, 10),
        fin: data.fin?.substring(0, 10),
      };

      console.log('Promotion après conversion:', this.promotion);
    });
  }

  updatePromotion(): void {
    this.promotionService.updatePromotion(this.promotionId, this.promotion)
      .subscribe({
        next: () => {
          alert('Promotion modifiée avec succès');
          this.router.navigate(['/promotions']);
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de la modification');
        }
      });
  }
}