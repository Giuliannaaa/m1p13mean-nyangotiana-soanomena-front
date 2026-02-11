import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProduitService } from '../../services/produits/produits.service';
import { AchatService } from '../../services/achat/achat.service';
import { PromotionService } from '../../services/promotion/promotion.service';
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
  produit: any = null;
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
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private produitService: ProduitService,
    private achatService: AchatService,
    private promotionService: PromotionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.prod_id = this.route.snapshot.paramMap.get('prod_id')!;
    // console.log('ID Produit:', this.prod_id);
    this.loadProduit();
    this.loadPromotionActive();
  }

  loadProduit(): void {
    this.produitService.getProduitById(this.prod_id).subscribe({
      next: (response: any) => {
        // console.log('Réponse API:', response);

        // ✅ Les vraies données sont dans response.data !
        const data = response.data || response;

        // console.log('Données du produit:', data);

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
        this.nom_prod = data.nom_prod || '';
        this.prix_unitaire = prixUnitaire;

        // Récupérer l'image principale
        if (data.image_Url) {
          this.image_Url = data.image_Url;
        } else if (data.images && data.images.length > 0) {
          const imageIndex = data.image_principale || 0;
          this.image_Url = data.images[imageIndex];
        }

        if (this.produit.livraison.disponibilite) {
          this.frais_livraison = this.produit.livraison.frais;
        }

        this.calculateTotal();
        this.isLoading = false;

        // console.log('Produit chargé avec succès:', this.produit);
        // console.log('Nom:', this.nom_prod);
        // console.log('Prix:', this.prix_unitaire);
      },
      error: (err: any) => {
        console.error('Erreur au chargement du produit:', err);
        this.isLoading = false;
      }
    });
  }

  loadPromotionActive(): void {
    this.promotionService.getPromotionActiveByProduit(this.prod_id).subscribe({
      next: (promo: any) => {
        console.log('Promotion reçue:', promo);

        if (promo && promo.data) {
          promo = promo.data;
        }

        if (promo) {
          this.promotionActive = {
            ...promo,
            montant: promo.montant?.$numberDecimal
              ? parseFloat(promo.montant.$numberDecimal)
              : parseFloat(promo.montant)
          };
          this.calculateTotal();
          console.log('Promotion active appliquée:', this.promotionActive);
        }
      },
      error: (err: any) => {
        console.log('Aucune promotion active pour ce produit');
      }
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
      quantity: this.quantity,
      frais_livraison: this.frais_livraison,
      avec_livraison: this.avec_livraison
    };

    // console.log('Envoi achat:', achat);

    this.achatService.addAchat(achat, this.prod_id).subscribe({
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