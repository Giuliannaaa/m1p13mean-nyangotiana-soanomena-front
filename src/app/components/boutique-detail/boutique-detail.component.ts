import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BoutiqueService } from '../../services/boutique.service';
import { ProduitService } from '../../services/produits.service';
import { NoteBoutiqueComponent } from '../../components/note-boutique/note-boutique.component';

@Component({
  selector: 'app-boutique-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NoteBoutiqueComponent],
  templateUrl: './boutique-detail.component.html',
  styleUrl: './boutique-detail.component.css'
})
export class BoutiqueDetailComponent implements OnInit {
  boutique: any = null;
  produits: any[] = [];
  isLoading: boolean = true;

  private route = inject(ActivatedRoute);
  private boutiqueService = inject(BoutiqueService);
  private produitService = inject(ProduitService);

  ngOnInit(): void {
    // Récupérer l'ID de la boutique depuis l'URL
    this.route.params.subscribe(params => {
      const boutiqueId = params['id'];
      if (boutiqueId) {
        this.loadBoutique(boutiqueId);
        this.loadProduitsOfBoutique(boutiqueId);
      }
    });
  }

  loadBoutique(id: string): void {
    this.boutiqueService.getBoutiqueById(id).subscribe({
      next: (data: any) => {
        console.log('Boutique reçue:', data);
        this.boutique = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement boutique:', err);
        this.isLoading = false;
      }
    });
  }

  loadProduitsOfBoutique(boutiqueId: string): void {
    this.produitService.getProduits().subscribe({
      next: (response: any) => {
        const allProduits = response.data || response;
        // Filtrer les produits de cette boutique
        this.produits = allProduits.filter((p: any) => 
          p.store_id?._id === boutiqueId || p.store_id === boutiqueId
        );
      },
      error: (err) => {
        console.error('Erreur chargement produits:', err);
      }
    });
  }

  getRatingStar(): string {
    if (!this.boutique || !this.boutique.rating) return '☆☆☆☆☆';
    
    const rating = this.boutique.rating;
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars += i <= rating ? '⭐' : '☆';
    }
    return stars;
  }
}