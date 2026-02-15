import { Component, inject, OnInit } from '@angular/core';
import { ProduitService } from '../../services/produits/produits.service';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { BoutiqueService } from '../../services/boutique/boutique.service';

@Component({
  selector: 'app-produit-edit',
  imports: [CommonModule, FormsModule, RouterModule], // OBLIGATOIRE
  standalone: true,
  templateUrl: './produit-edit.component.html',
  styleUrl: './produit-edit.component.css',
})

export class ProduitEditComponent {

  boutiques: any[] = [];
  produit: any = {
    nom_prod: '',
    store_id: '',
    descriptions: '',
    prix_unitaire: 0,
    stock_etat: true,
    type_produit: 'PRODUIT',
    livraison: { disponibilite: false, frais: 0 },
    image_Url: '',
    stock: 0
  };


  produitId!: string;
  selectedFile!: File;

  constructor(private produitService: ProduitService,
    private router: Router, // si tu veux récupérer id pour édition
    private route: ActivatedRoute) { }
  private boutiqueService = inject(BoutiqueService);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.produitId = id;

    this.produitService.getProduitById(id).subscribe((response: any) => {
      console.log('Produit à modifier (raw):', response);

      // Adaptation selon la structure de la réponse (response.data ou response direct)
      const data = response.data || response;
      this.produit = data;

      // Gestion de store_id peuplé (objet) ou non (string)
      if (this.produit.store_id && typeof this.produit.store_id === 'object') {
        this.produit.store_id = this.produit.store_id._id;
      }

      // Initialisation par défaut de livraison si manquant
      if (!this.produit.livraison) {
        this.produit.livraison = { disponibilite: false, frais: 0 };
      }

      // Mapping propre du prix (Decimal128 ou number)
      if (this.produit.prix_unitaire && this.produit.prix_unitaire.$numberDecimal) {
        this.produit.prix_unitaire_val = parseFloat(this.produit.prix_unitaire.$numberDecimal);
      } else {
        this.produit.prix_unitaire_val = this.produit.prix_unitaire;
      }

      // console.log('Produit après mapping:', this.produit);
    });

    this.loadBoutiques();
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

  loadBoutiques() {
    this.boutiqueService.getAllBoutiques().subscribe({
      next: (response: any) => {
        // Gérer le format { data: [...] } ou [...]
        if (response && response.data) {
          this.boutiques = response.data;
        } else {
          this.boutiques = response;
        }
        // console.log('Boutiques chargées:', this.boutiques);
      },
      error: (err) => {
        console.error('Erreur chargement boutiques:', err);
      }
    });
  }


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
    formData.append('store_id', this.produit.store_id);
    formData.append('stock', this.produit.stock);

    if (this.selectedFile) {
      formData.append('image_Url', this.selectedFile);
    }

    this.produitService.updateProduit(this.produitId, formData)
      .subscribe(() => {
        this.router.navigate(['/produits']);
      });
  }

}
