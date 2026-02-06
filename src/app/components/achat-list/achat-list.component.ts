import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AchatService } from '../../services/achat.service';
import { BoutiqueService } from '../../services/boutique.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-achat-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './achat-list.component.html',
  styleUrls: ['./achat-list.component.css']
})
export class AchatListComponent implements OnInit {

  achats: any[] = [];
  filteredAchats: any[] = []; // ✅ Ajouter les achats filtrés
  
  // ✅ Variables pour le filtre
  boutiques: any[] = [];
  boutique_selectionnee: string = '';
  isFiltering: boolean = false;

  constructor(
    private achatService: AchatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAchats();
  }

  loadAchats(): void {
    this.achatService.getAchats().subscribe({
      next: (response: any) => {
        console.log('Achats reçus:', response);
        
        // Gérer les deux formats de réponse
        const achatsData = Array.isArray(response) ? response : (response.data || []);
        
        this.achats = achatsData.map((achat: any) => ({
          ...achat,
          total_achat: this.convertDecimal(achat.total_achat),
          reduction: this.convertDecimal(achat.reduction),
          frais_livraison: this.convertDecimal(achat.frais_livraison),
          total_reel: this.convertDecimal(achat.total_reel),
          // ✅ Récupérer le nom de la boutique
          nom_boutique: achat.store_id?.name || 'Boutique inconnue'
        }));
        
        // ✅ Extraire les boutiques uniques
        this.extractBoutiques();
        
        // ✅ Initialiser le filtre avec tous les achats
        this.filteredAchats = this.achats;
        
        console.log('Achats convertis:', this.achats);
        console.log('Boutiques trouvées:', this.boutiques);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Erreur chargement achats:', err)
    });
  }

  // ✅ Extraire les boutiques uniques des achats
  extractBoutiques(): void {
    const boutiquesMap = new Map();
    
    this.achats.forEach(achat => {
      if (achat.store_id?._id && achat.store_id?.name) {
        if (!boutiquesMap.has(achat.store_id._id)) {
          boutiquesMap.set(achat.store_id._id, achat.store_id.name);
        }
      }
    });
    
    this.boutiques = Array.from(boutiquesMap, ([id, name]) => ({
      _id: id,
      name: name
    }));
  }

  // ✅ Filtrer les achats par boutique sélectionnée
  filterByBoutique(): void {
    if (!this.boutique_selectionnee) {
      // Si aucune boutique n'est sélectionnée, afficher tous les achats
      this.filteredAchats = this.achats;
      this.isFiltering = false;
    } else {
      // Filtrer les achats localement
      this.filteredAchats = this.achats.filter(achat => 
        achat.store_id?._id === this.boutique_selectionnee
      );
      this.isFiltering = true;
    }
    
    console.log('Achats filtrés:', this.filteredAchats.length);
    this.cdr.markForCheck();
  }

  // ✅ Réinitialiser le filtre
  resetFilter(): void {
    this.boutique_selectionnee = '';
    this.filteredAchats = this.achats;
    this.isFiltering = false;
    this.cdr.markForCheck();
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

      const cleanPath = img.replace(/\\/g, '/');
      return `http://localhost:5000/${cleanPath}`;
  }

  // Helper pour parser les Decimal128 dans le HTML
  parseFloat(value: any): number {
    return parseFloat(value);
  }

  // ✅ Helper pour récupérer le nom de la boutique
  getNomBoutique(achat: any): string {
    return achat.store_id?.name || achat.nom_boutique || 'Boutique inconnue';
  }
}