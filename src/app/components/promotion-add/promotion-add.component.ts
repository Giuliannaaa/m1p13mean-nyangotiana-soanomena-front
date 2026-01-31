import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PromotionService } from '../../services/promotion.service';
import { ProduitService } from '../../services/produits.service';

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

  constructor(
    private promotionService: PromotionService,
    private produitService: ProduitService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.produitService.getProduits().subscribe({
      next: (data) => this.produits = data,
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
        this.router.navigate(['/promotions']);
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors de l'ajout de la promotion");
      }
    });
  }
}
