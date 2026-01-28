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

  constructor(private produitService: ProduitService,
                private router: Router, // si tu veux récupérer id pour édition
                private route: ActivatedRoute){ }

  ngOnInit(): void {
  const id = this.route.snapshot.params['id'];
  this.produitService.getProduitById(id).subscribe((data: any) => {
    this.produit = data; // contient toutes les anciennes valeurs
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
  const file = event.target.files[0];
  if (file) {
    // Option simple : convertir en URL pour affichage direct
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.produit.image_Url = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}


  updateProduit(): void {
    this.produitService.updateProduit(this.produitId, this.produit)
      .subscribe(() => {
        this.router.navigate(['/produits']);
      });
  }

}
