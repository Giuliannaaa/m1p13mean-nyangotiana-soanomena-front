import { Component } from '@angular/core';
import { ProduitService } from '../../services/produits.service';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-produit-add',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './produit-add.component.html',
  styleUrl: './produit-add.component.css',
})
export class ProduitAddComponent {

  newProduit = {
    nom_prod: '',
    descriptions: '',
    prix_unitaire: null,
    stock_etat: true,
    type_produit: 'PRODUIT',
    livraison: {
      disponibilite: false,
      frais: 0
    },
    image_Url: '',
    store_id: '',
    name: ''
  };

  selectedFile!: File;
  boutiques: any[] = [];
  isAdmin: boolean = false;

  constructor(
    private produitService: ProduitService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.isAdmin = user.role === 'Admin';

    // Si admin, récupérer toutes les boutiques
    if (this.isAdmin) {
      this.produitService.getBoutiques().subscribe({
        next: (res: any) => {
          console.log('Réponse boutiques:', res); // DEBUG
          // selon la structure renvoyée par le backend
          this.boutiques = res.data ? res.data : res;
        },
        error: err => console.error('Erreur loadBoutiques:', err)
      });
    }if (user.role === 'Boutique') {
      // si propriétaire, on fixe sa boutique
      this.newProduit.store_id = user.boutiqueId;
      this.newProduit.name = user.boutiqueName; // si tu as le nom
      console.log(this.newProduit.name);
      
    }
  }

  onBoutiqueSelected(storeId: string) {
    const boutique = this.boutiques.find(b => b._id === storeId);
    if (boutique) {
      this.newProduit.name = boutique.nom;
    }
  }

  onImageSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  addProduit() {
    const formData = new FormData();
    formData.append('nom_prod', this.newProduit.nom_prod);
    formData.append('descriptions', this.newProduit.descriptions);
    formData.append('prix_unitaire', String(this.newProduit.prix_unitaire));
    formData.append('stock_etat', String(this.newProduit.stock_etat));
    formData.append('type_produit', this.newProduit.type_produit);
    formData.append('store_id', this.newProduit.store_id);
    formData.append('name', this.newProduit.name);
    formData.append('livraison', JSON.stringify(this.newProduit.livraison));
    if (this.selectedFile) {
      formData.append('image_Url', this.selectedFile);
    }

    this.produitService.addProduit(formData).subscribe({
      next: () => {
        alert('Produit ajouté avec succès !');
        this.router.navigate(['/produits']);
      },
      error: err => console.error('Erreur ajout produit:', err)
    });
  }
}
