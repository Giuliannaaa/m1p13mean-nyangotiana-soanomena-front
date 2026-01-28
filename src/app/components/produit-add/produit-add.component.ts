import { Component } from '@angular/core';
import { ProduitService } from '../../services/produits.service';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from '@angular/router';   

@Component({
  selector: 'app-produit-add',
  imports: [CommonModule, FormsModule], // OBLIGATOIRE
  standalone: true,
  templateUrl: './produit-add.component.html',
  styleUrl: './produit-add.component.css',
})

export class ProduitAddComponent {


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
  
    constructor(private produitService: ProduitService,
                private router: Router, // si tu veux récupérer id pour édition
                private route: ActivatedRoute
    ){ }
  
    
  /**
   * REHEFA VITA LE BOUTIQUE 
   * boutiques = [];

      ngOnInit() {
        this.boutiqueService.getMesBoutiques().subscribe(data => {
          this.boutiques = data;
        });
      }
     
      ITO ANATY HTML PRODUIT-ADD

      <select [(ngModel)]="produit.store_id" required>
      <option value="">-- Choisir une boutique --</option>

      for (b of boutiques; track b._id) {
        <option [value]="b._id">{{ b.nom }}</option>
      }
    </select>

   */
    /*addProduit(): void {
      this.produitService.addProduit(this.newProduit).subscribe(() => {
        this.resetForm();
      });
    }*/

    /*addProduit(): void {
      this.produitService.addProduit(this.newProduit)
        .subscribe(() => {
          this.router.navigate(['/produits']);
        });
    }*/

selectedFile!: File;


    onImageSelected(event: any) {
      this.selectedFile = event.target.files[0];
    }


    addProduit() {
      const formData = new FormData();

      formData.append('store_id', this.newProduit.store_id);
      formData.append('nom_prod', this.newProduit.nom_prod);
      formData.append('descriptions', this.newProduit.descriptions);
      formData.append('prix_unitaire', String(this.newProduit.prix_unitaire));
      formData.append('stock_etat', String(this.newProduit.stock_etat));
      formData.append('type_produit', this.newProduit.type_produit);

      // 👇 objet → JSON
      formData.append(
        'livraison',
        JSON.stringify(this.newProduit.livraison)
      );

      if (this.selectedFile) {
        formData.append('image_Url', this.selectedFile);
      }

      this.produitService.addProduit(formData).subscribe({
        next: () => {
          alert('Produit ajouté');
          this.router.navigate(['/produits']);
        },
        error: err => console.error(err)
      });
    }



    /*onFileSelected(event: any) {
  this.selectedFile = event.target.files[0];
}

submit() {
  const formData = new FormData();
  formData.append('image_Url', this.selectedFile);
  formData.append('nom', this.newProduit.nom);
  formData.append('prix', this.newProduit.prix);

  this.http.post('http://localhost:3000/produits', formData).subscribe();
}*/

  
}
