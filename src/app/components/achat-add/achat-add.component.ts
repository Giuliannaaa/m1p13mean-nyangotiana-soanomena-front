import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProduitService } from '../../services/produits.service';
import { AchatService } from '../../services/achat.service';
import { PromotionService } from '../../services/promotion.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-achat-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './achat-add.component.html',
})
export class AchatAddComponent implements OnInit {

  prod_id!: string;
  produit: any;
  promotionActive: any = null;

  achat = {
    prod_id: '',
    quantity: 1,
    prix_unitaire: 0,
    total_achat: 0,
    reduction: 0,
    frais_livraison: 0, // ← Ajouter les frais de livraison
    avec_livraison: false, // ← Option pour activer/désactiver la livraison
    total_reel: 0
  };

  constructor(
    private route: ActivatedRoute,
    private produitService: ProduitService,
    private achatService: AchatService,
    private promotionService: PromotionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.prod_id = this.route.snapshot.paramMap.get('prod_id')!;
    this.loadProduit();
    this.loadPromotionActive();
  }

  loadProduit(): void {
    this.produitService.getProduitById(this.prod_id).subscribe(data => {
      const prixUnitaire = data.prix_unitaire?.$numberDecimal 
        ? parseFloat(data.prix_unitaire.$numberDecimal) 
        : (typeof data.prix_unitaire === 'number' ? data.prix_unitaire : 0);
      
      // Convertir les frais de livraison si c'est un Decimal128
      const fraisLivraison = data.livraison?.frais?.$numberDecimal
        ? parseFloat(data.livraison.frais.$numberDecimal)
        : (typeof data.livraison?.frais === 'number' ? data.livraison.frais : 0);
      
      this.produit = {
        ...data,
        prix_unitaire: prixUnitaire,
        livraison: {
          disponibilite: data.livraison?.disponibilite || false,
          frais: fraisLivraison
        }
      };
      
      this.achat.prod_id = data._id;
      this.achat.prix_unitaire = prixUnitaire;
      
      // Initialiser les frais de livraison si la livraison est disponible par défaut
      if (this.produit.livraison.disponibilite) {
        this.achat.frais_livraison = this.produit.livraison.frais;
      }
      
      this.calculateTotal();
    });
  }

  loadPromotionActive(): void {
    this.promotionService.getPromotionActiveByProduit(this.prod_id).subscribe({
      next: (promo: any) => {
        if (promo) {
          this.promotionActive = {
            ...promo,
            montant: promo.montant?.$numberDecimal 
              ? parseFloat(promo.montant.$numberDecimal) 
              : parseFloat(promo.montant)
          };
          this.calculateTotal();
        }
      },
      error: (err: any) => console.log('Aucune promotion active')
    });
  }

  // Nouvelle fonction pour gérer l'activation/désactivation de la livraison
  toggleLivraison(): void {
    if (this.achat.avec_livraison) {
      this.achat.frais_livraison = this.produit.livraison.frais;
    } else {
      this.achat.frais_livraison = 0;
    }
    this.calculateTotal();
  }

  calculateTotal(): void {
    // Total avant réduction
    this.achat.total_achat = this.achat.quantity * this.achat.prix_unitaire;
    
    // Calculer la réduction selon la promotion
    if (this.promotionActive) {
      if (this.promotionActive.type_prom === 'POURCENTAGE') {
        this.achat.reduction = this.achat.total_achat * (this.promotionActive.montant / 100);
      } else {
        this.achat.reduction = this.promotionActive.montant * this.achat.quantity;
      }
    } else {
      this.achat.reduction = 0;
    }
    
    // Total final = (Total achat - Réduction) + Frais de livraison
    this.achat.total_reel = this.achat.total_achat - this.achat.reduction + this.achat.frais_livraison;
  }

  submitAchat(): void {
    this.achatService.addAchat(this.achat).subscribe({
      next: () => {
        alert('Achat effectué avec succès');
        this.router.navigate(['/achats']);
      },
      error: (err: any) => {
        console.error('Erreur achat:', err);
        alert("Erreur lors de l'achat");
      }
    });
  }
}