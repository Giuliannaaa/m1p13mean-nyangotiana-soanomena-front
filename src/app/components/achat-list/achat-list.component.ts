import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AchatService } from '../../services/achat.service';

@Component({
  selector: 'app-achat-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './achat-list.component.html',
  styleUrls: ['./achat-list.component.css']
})
export class AchatListComponent implements OnInit {

  achats: any[] = [];

  constructor(
    private achatService: AchatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAchats();
  }

  loadAchats(): void {
    this.achatService.getAchats().subscribe({
      next: (response: any) => { // ← Ajouter : any pour éviter l'erreur TypeScript
        console.log('Achats reçus:', response);
        
        // Gérer les deux formats de réponse
        const achatsData = Array.isArray(response) ? response : (response.data || []);
        
        this.achats = achatsData.map((achat: any) => ({
          ...achat,
          total_achat: this.convertDecimal(achat.total_achat),
          reduction: this.convertDecimal(achat.reduction),
          frais_livraison: this.convertDecimal(achat.frais_livraison),
          total_reel: this.convertDecimal(achat.total_reel)
        }));
        
        console.log('Achats convertis:', this.achats);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Erreur chargement achats:', err)
    });
  }

  convertDecimal(value: any): number {
    if (value?.$numberDecimal) {
      return parseFloat(value.$numberDecimal);
    }
    return typeof value === 'number' ? value : 0;
  }

  deleteAchat(id: string): void {
    if (confirm('Supprimer cet achat ?')) {
      this.achatService.deleteAchat(id).subscribe({
        next: () => {
          alert('Achat supprimé avec succès');
          this.loadAchats();
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  // Récupérer l'image du produit
  getProductImage(item: any): string {

    const img =
      item.image_url ||
      item.image_Url ||
      item?.prod_id?.image_Url ||
      item?.prod_id?.image_url;

    if (img) {
      const cleanPath = img.replace(/\\/g, '/');
      return `http://localhost:5000/${cleanPath}`;
    }

    return 'https://via.placeholder.com/150?text=No+Image';
  }




  // Helper pour parser les Decimal128 dans le HTML
  parseFloat(value: any): number {
    return parseFloat(value);
  }
}