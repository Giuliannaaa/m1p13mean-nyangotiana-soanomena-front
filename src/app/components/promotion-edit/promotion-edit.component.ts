import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // ← Ajoute RouterModule
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PromotionService } from '../../services/promotion.service';
import { ProduitService } from '../../services/produits.service';

@Component({
  selector: 'app-promotion-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // ← Ajoute RouterModule pour le routerLink dans le HTML
  templateUrl: './promotion-edit.component.html',
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private promotionService: PromotionService,
    private produitService: ProduitService
  ) {}

  ngOnInit(): void {
    this.promotionId = this.route.snapshot.paramMap.get('id')!;
    this.loadProduits();
    this.loadPromotion();
  }

  loadProduits(): void {
    this.produitService.getProduits().subscribe(data => {
      this.produits = data;
    });
  }

  loadPromotion(): void {
    this.promotionService.getPromotionById(this.promotionId).subscribe(data => {
      console.log('Données reçues:', data); // ← Pour déboguer
      
      this.promotion = {
        ...data,
        prod_id: data.prod_id?._id || data.prod_id,
        // ← CORRECTION ICI : Convertir le Decimal128 en nombre
        montant: data.montant?.$numberDecimal 
          ? parseFloat(data.montant.$numberDecimal) 
          : (typeof data.montant === 'number' ? data.montant : 0),
        debut: data.debut?.substring(0, 10),
        fin: data.fin?.substring(0, 10),
      };
      
      console.log('Promotion après conversion:', this.promotion); // ← Pour vérifier
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