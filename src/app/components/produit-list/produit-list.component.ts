import { Component, OnInit, inject } from '@angular/core';
import { ProduitService } from '../../services/produits.service';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Produit } from '../../models/produit.model';
import { Router } from "@angular/router";
import { PanierService } from '../../services/panier.service';


@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './produit-list.component.html',
  styleUrls: ['./produit-list.component.css'],
})

export class ProduitListComponent implements OnInit {
  produits: Produit[] = [];
  newProduit = {
    store_id: '',
    nom_prod: '',
    descriptions: '',
    prix_unitaire: null,
    stock_etat: true,
    type_produit: 'PRODUIT',
    livraison: {
      disponibilite: false,
      frais: 0
    },
    image_Url: ''
  };

  authService = inject(AuthService);
  isAdmin = false;
  isBoutique = false;
  isAcheteur = false;

  constructor(private produitService: ProduitService,
    private router: Router,
    private panierService: PanierService
  ) { }

  ngOnInit(): void {
    const role = this.authService.getRole();
    this.isAdmin = role === 'Admin';
    this.isBoutique = role === 'Boutique';
    this.isAcheteur = role === 'Acheteur';

    // Le backend gère déjà le filtrage selon le rôle
    this.loadProduits();
  }

  /*addProduit():void {
    if (this.newProduit.store_id && this.newProduit.nom_prod && this.newProduit.descriptions 
      && this.newProduit.prix_unitaire && this.newProduit.stock_etat && this.newProduit.type_produit
      && this.newProduit.livraison && this.newProduit.image_Url
     ) {
      this.produitService.addProduit(this.newProduit).subscribe(() => {
        this.loadProduits(); //Recharge après ajout
        this.newProduit = {
            store_id: '',
            nom_prod: '',
            descriptions: '',
            prix_unitaire: null,
            stock_etat: true,
            type_produit: 'PRODUIT',
            livraison: {
              disponibilite: false,
              frais: 0
            },
            image_Url: ''
      };
 //Reinitialisation du formulaire
      });
    }
  }*/

  loadProduits(): void {
    this.produitService.getProduits().subscribe({
      next: (response) => {
        // Plus besoin de filtrer ici, le backend le fait déjà
        this.produits = response.data;
      },
      error: (err) => {
        console.error("Erreur lors du chargement des produits", err);
      }
    });
  }

  deleteProduit(id: string): void {
    this.produitService.deleteProduit(id).subscribe(() => this.loadProduits());
  }

  // Dans ton composant de liste produits
  goToBuyProduct(prodId: string): void {
    // Legacy: Direct purchase
    this.router.navigate(['/achats/ajouter', prodId]);
  }

  addToPanier(produit: Produit): void {
    if (!this.isAcheteur) {
      alert("Vous devez être connecté en tant qu'acheteur pour ajouter au panier.");
      return;
    }

    // Default quantity 1
    this.panierService.addToPanier(produit._id, 1).subscribe({
      next: (res) => {
        alert('Produit ajouté au panier !');
        // Optional: navigate to cart or stay
      },
      error: (err: string) => {
        console.error(err);
        alert("Erreur lors de l'ajout au panier");
      }
    });
  }
}
