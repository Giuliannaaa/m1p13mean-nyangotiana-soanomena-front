import { Component, OnInit } from '@angular/core';
import { ProduitService } from '../../services/produits.service';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";   
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // OBLIGATOIRE
  templateUrl: './produit-list.component.html',
  styleUrls: ['./produit-list.component.css'], 
})



export class ProduitListComponent implements OnInit {
  produits: any[] = [];
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
 //Nouveau modèle pour le formulaire

  constructor(private produitService: ProduitService){ }

  ngOnInit(): void {
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
    next: (data) => {
      this.produits = data; // on stocke les produits récupérés
    },
    error: (err) => {
      console.error("Erreur lors du chargement des produits", err);
    }
  });
}


  deleteProduit(id: string): void {
    this.produitService.deleteProduit(id).subscribe(() => this.loadProduits());
  }
}
