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

  // Données pour l'affichage
  quantity: number = 1;
  prix_unitaire: number = 0;
  total_achat: number = 0;
  reduction: number = 0;
  frais_livraison: number = 0;
  avec_livraison: boolean = false;
  total_reel: number = 0;

  // Infos du produit
  nom_prod: string = '';
  image_Url: string = '';

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
      console.log('Produit chargé:', data);
      
      const prixUnitaire = data.prix_unitaire?.$numberDecimal 
        ? parseFloat(data.prix_unitaire.$numberDecimal) 
        : (typeof data.prix_unitaire === 'number' ? data.prix_unitaire : 0);
      
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
      
      // Stocker les infos
      this.nom_prod = data.nom_prod;
      this.prix_unitaire = prixUnitaire;
      
      // Récupérer l'image principale
      if (data.images && data.images.length > 0) {
        const imageIndex = data.image_principale || 0;
        this.image_Url = data.images[imageIndex];
      }
      
      if (this.produit.livraison.disponibilite) {
        this.frais_livraison = this.produit.livraison.frais;
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

  toggleLivraison(): void {
    if (this.avec_livraison) {
      this.frais_livraison = this.produit.livraison.frais;
    } else {
      this.frais_livraison = 0;
    }
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.total_achat = this.quantity * this.prix_unitaire;
    
    if (this.promotionActive) {
      if (this.promotionActive.type_prom === 'POURCENTAGE') {
        this.reduction = this.total_achat * (this.promotionActive.montant / 100);
      } else {
        this.reduction = this.promotionActive.montant * this.quantity;
      }
    } else {
      this.reduction = 0;
    }
    
    this.total_reel = this.total_achat - this.reduction + this.frais_livraison;
  }

  submitAchat(): void {

  const achat = {
    prod_id: this.prod_id,
    quantity: this.quantity,
    frais_livraison: this.frais_livraison,
    avec_livraison: this.avec_livraison
  };

  console.log('Envoi achat:', achat);

    this.achatService.addAchat(achat).subscribe({
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