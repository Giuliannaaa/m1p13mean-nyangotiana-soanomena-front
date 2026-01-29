import { Component, OnInit } from '@angular/core';
import { ProduitService } from '../../services/produits.service';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-produit-edit',
  imports: [CommonModule, FormsModule, RouterModule], // OBLIGATOIRE
  standalone: true,
  templateUrl: './produit-edit.component.html',
  styleUrl: './produit-edit.component.css',
})

export class ProduitEditComponent {

  //boutiques: any[] = [];
  produit: any = {
    nom_prod: '',
    descriptions: '',
    prix_unitaire: 0,
    stock_etat: true,
    type_produit: 'PRODUIT',
    livraison: { disponibilite: false, frais: 0 },
    image_Url: ''
  };


  produitId!: string;
  selectedFile!: File;

  constructor(private produitService: ProduitService,
    private router: Router, // si tu veux récupérer id pour édition
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.produitId = id; // FIX: Stocker l'ID
    this.produitService.getProduitById(id).subscribe((data: any) => {
      this.produit = data; // contient toutes les anciennes valeurs

      // Si prix_unitaire est un objet Decimal128 avec $numberDecimal
      if (this.produit.prix_unitaire && this.produit.prix_unitaire.$numberDecimal) {
        this.produit.prix_unitaire_val = parseFloat(this.produit.prix_unitaire.$numberDecimal);
      } else {
        this.produit.prix_unitaire_val = this.produit.prix_unitaire;
      }
    });
  }

  /** VERSION COMPLETE
   * 
   * ngOnInit(): void {
    const produitId = this.route.snapshot.params['id'];
    const userId = 'USER_TEMP_ID'; // provisoire
  
    //  Charger les boutiques du commerçant
    this.boutiqueService.getMesBoutiques(userId).subscribe(boutiques => {
      this.boutiques = boutiques;
    });
  
    // Charger le produit à modifier
    this.produitService.getProduitById(produitId).subscribe((data: any) => {
      this.produit = data;
    });
  }
  
   */


  loadProduit(): void {
    this.produitService.getProduitById(this.produitId)
      .subscribe(data => this.produit = data);
  }

  toggleFraisLivraison(): void {
    if (!this.produit.livraison.disponibilite) {
      this.produit.livraison.frais = 0; // si livraison non dispo, frais = 0
    }
  }

  onImageSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.produit.image_preview = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }


  updateProduit(): void {
    const formData = new FormData();

    formData.append('nom_prod', this.produit.nom_prod);
    formData.append('descriptions', this.produit.descriptions);
    formData.append('prix_unitaire', String(this.produit.prix_unitaire_val));
    formData.append('stock_etat', String(this.produit.stock_etat));
    formData.append('type_produit', this.produit.type_produit);
    formData.append('livraison', JSON.stringify(this.produit.livraison));

    if (this.selectedFile) {
      formData.append('image_Url', this.selectedFile);
    }

    this.produitService.updateProduit(this.produitId, formData)
      .subscribe(() => {
        this.router.navigate(['/produits']);
      });
  }

}
