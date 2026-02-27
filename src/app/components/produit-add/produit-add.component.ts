import { Component, inject, OnInit } from '@angular/core';
import { ProduitService } from '../../services/produits/produits.service';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BoutiqueService } from '../../services/boutique/boutique.service';
import imageCompression from 'browser-image-compression';
import { environment } from '../../../environments/environment.prod';
import { uploadToCloudinary } from '../../services/cloudinary/uploadToCloudinary';

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
    image_Url: '',
    stock: 0
  };

  isCompressing = false;
  isUploading = false;

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

  // Compression d'une image
  private async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 300,           // max 1MB par image
      maxWidthOrHeight: 1024, // redimensionner si trop grand
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  }

  selectedFile!: File;

  onImageSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  async addProduit(): Promise<void> {
    if (!this.newProduit.store_id) { alert('Veuillez sélectionner une boutique'); return; }
    if (!this.newProduit.nom_prod) { alert('Veuillez entrer le nom du produit'); return; }
    if (!this.newProduit.prix_unitaire) { alert('Veuillez entrer le prix unitaire'); return; }

    this.isUploading = true;

    try {
      if (environment.production) {
        // ── PROD : créer sans image → récupérer l'_id → uploader sur Cloudinary → mettre à jour ──
        const payload: any = {
          nom_prod: this.newProduit.nom_prod,
          descriptions: this.newProduit.descriptions,
          prix_unitaire: this.newProduit.prix_unitaire,
          stock_etat: this.newProduit.stock_etat,
          type_produit: this.newProduit.type_produit,
          store_id: this.newProduit.store_id,
          stock: this.newProduit.stock,
          livraison: this.newProduit.livraison,
        };

        this.produitService.addProduit(payload).subscribe({
          next: async (response: any) => {
            const productId = response.data._id;

            if (this.selectedFile) {
              try {
                const compressed = await this.compressImage(this.selectedFile);
                const url = await uploadToCloudinary(compressed, `product/${productId}`);

                // Mettre à jour le produit avec l'URL
                await this.produitService.updateProduit(productId, { image_Url: url }).toPromise();

              } catch (err) {
                console.error('Erreur upload image:', err);
                alert('Produit créé mais erreur lors de l\'upload de l\'image');
              }
            }

            alert('Produit ajouté avec succès');
            this.router.navigate(['/produits']);
          },
          error: (err: any) => {
            console.error('Erreur lors de l\'ajout du produit:', err);
            alert('Erreur : ' + (err.error?.message || err.message || 'Une erreur est survenue'));
          }
        });

      } else {
        // ── DEV : compress + envoi multipart ──
        const formData = new FormData();
        formData.append('nom_prod', this.newProduit.nom_prod);
        formData.append('descriptions', this.newProduit.descriptions);
        formData.append('prix_unitaire', String(this.newProduit.prix_unitaire));
        formData.append('stock_etat', String(this.newProduit.stock_etat));
        formData.append('type_produit', this.newProduit.type_produit);
        formData.append('store_id', this.newProduit.store_id);
        formData.append('stock', String(this.newProduit.stock));
        formData.append('livraison', JSON.stringify(this.newProduit.livraison));

        if (this.selectedFile) {
          const compressed = await this.compressImage(this.selectedFile);
          formData.append('image_Url', compressed, this.selectedFile.name);
        }

        this.produitService.addProduit(formData).subscribe({
          next: () => {
            alert('Produit ajouté avec succès');
            this.router.navigate(['/produits']);
          },
          error: (err: any) => {
            console.error('Erreur lors de l\'ajout du produit:', err);
            alert('Erreur : ' + (err.error?.message || err.message || 'Une erreur est survenue'));
          }
        });
      }

    } catch (err) {
      console.error('Erreur upload:', err);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      this.isUploading = false;
    }
  }
}