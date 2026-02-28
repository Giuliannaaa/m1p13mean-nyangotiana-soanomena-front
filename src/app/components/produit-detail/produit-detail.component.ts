import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../../services/produits/produits.service';
import { AuthService } from '../../services/auth/auth.service';
import { SignalerProduitComponent } from '../../components/signalement-produit/signalement-produit.component';
import { PanierService } from '../../services/panier/panier.service';
import { environment } from '../../../environments/environment';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';

@Component({
  selector: 'app-produit-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SignalerProduitComponent, ImageUrlPipe],
  templateUrl: './produit-detail.component.html',
  styleUrl: './produit-detail.component.css'
})
export class ProduitDetailComponent implements OnInit {
  produit: any = null;
  produitId: string = '';
  isLoading: boolean = true;
  isAcheteur: boolean = false;
  showReportModal: boolean = false;

  private route = inject(ActivatedRoute);
  private produitService = inject(ProduitService);
  private authService = inject(AuthService);
  private panierService = inject(PanierService);

  ngOnInit(): void {
    this.isAcheteur = this.authService.getRole() === 'Acheteur';

    // RÉCUPÉRER L'ID ET LE STOCKER
    this.route.params.subscribe(params => {
      this.produitId = params['id']; // Stocker dans la propriété
      console.log('Produit ID reçu:', this.produitId); // Debug

      if (this.produitId) {
        this.loadProduit(this.produitId);
      }
    });
  }

  loadProduit(id: string): void {
    this.produitService.getProduitById(id).subscribe({
      next: (data: any) => {
        console.log('Produit reçu:', data);
        // S'ASSURER QUE data.data OU data EST UTILISÉ
        this.produit = data.data || data;
        this.produitId = this.produit._id; // Mettre à jour aussi l'ID
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produit:', err);
        this.isLoading = false;
      }
    });
  }

  getStockStatus(): string {
    return this.produit?.stock_etat ? 'En stock' : 'Rupture de stock';
  }

  getStockColor(): string {
    return this.produit?.stock_etat ? '#28a745' : '#dc3545';
  }



  toggleReportModal(): void {
    this.showReportModal = !this.showReportModal;
  }

  onAddToPanier(): void {
    if (!this.produit?._id) return;

    if (!this.isAcheteur) {
      alert("Vous devez être connecté en tant qu'acheteur pour ajouter au panier.");
      return;
    }

    this.panierService.addToPanier(this.produit._id, 1).subscribe({
      next: () => alert('Produit ajouté au panier !'),
      error: (err) => {
        console.error(err);
        alert("Erreur lors de l'ajout au panier");
      }
    });
  }
}