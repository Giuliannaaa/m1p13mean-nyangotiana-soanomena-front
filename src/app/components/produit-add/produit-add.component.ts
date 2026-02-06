import { Component, inject, OnInit } from '@angular/core';
import { ProduitService } from '../../services/produits.service';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BoutiqueService } from '../../services/boutique.service';

@Component({
  selector: 'app-produit-add',
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true,
  templateUrl: './produit-add.component.html',
  styleUrl: './produit-add.component.css',
})
export class ProduitAddComponent implements OnInit {

  produits: any[] = [];
  boutiques: any[] = [];

  newProduit = {
    nom_prod: '',
    store_id: '',
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

  private boutiqueService = inject(BoutiqueService);
  private produitService = inject(ProduitService);

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadBoutiques();
  }

  loadBoutiques(): void {
    this.boutiqueService.getAllBoutiques().subscribe({
      next: (response: any) => {
        // console.log('Réponse boutiques:', response);
        this.boutiques = response.data;
      },
      error: (err: any) => {
        console.error('Erreur chargement boutiques:', err);
        this.boutiques = [];
      }
    });
  }

  selectedFile!: File;

  onImageSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  addProduit(): void {
    // Vérifier que les données requises sont présentes
    if (!this.newProduit.store_id) {
      alert('Veuillez sélectionner une boutique');
      return;
    }

    if (!this.newProduit.nom_prod) {
      alert('Veuillez entrer le nom du produit');
      return;
    }

    if (!this.newProduit.prix_unitaire) {
      alert('Veuillez entrer le prix unitaire');
      return;
    }

    const formData = new FormData();

    formData.append('nom_prod', this.newProduit.nom_prod);
    formData.append('descriptions', this.newProduit.descriptions);
    formData.append('prix_unitaire', String(this.newProduit.prix_unitaire));
    formData.append('stock_etat', String(this.newProduit.stock_etat));
    formData.append('type_produit', this.newProduit.type_produit);
    formData.append('store_id', this.newProduit.store_id);

    // Objet → JSON
    formData.append(
      'livraison',
      JSON.stringify(this.newProduit.livraison)
    );

    if (this.selectedFile) {
      formData.append('image_Url', this.selectedFile);
    }

    console.log('Envoi du produit...');

    this.produitService.addProduit(formData).subscribe({
      next: (response: any) => {
        console.log('Produit ajouté avec succès:', response);
        alert('Produit ajouté avec succès');
        this.router.navigate(['/produits']);
      },
      error: (err: any) => {
        console.error('Erreur lors de l\'ajout du produit:', err);
        alert('Erreur : ' + (err.error?.message || err.message || 'Une erreur est survenue'));
      }
    });
  }
}