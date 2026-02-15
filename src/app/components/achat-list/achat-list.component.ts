import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AchatService } from '../../services/achat/achat.service';
import { AuthService } from '../../services/auth/auth.service';
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
  userRole: string | null = null;

  constructor(
    private achatService: AchatService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.userRole = this.authService.getRole();
    this.loadAchats();
  }

  loadAchats(): void {
    this.achatService.getAchats().subscribe({
      next: (response: any) => {
        // console.log('Achats reçus:', response);

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

        // console.log('Achats convertis:', this.achats);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Erreur chargement achats:', err)
    });
  }

  // ✅ Extraire les boutiques uniques des achats
  extractBoutiques(): void {
    const boutiquesMap = new Map();

    this.achats.forEach(achat => {
      // Root store
      if (achat.store_id?._id && achat.store_id?.name) {
        boutiquesMap.set(achat.store_id._id, achat.store_id.name);
      }
      // Item stores
      if (achat.items) {
        achat.items.forEach((item: any) => {
          if (item.store_id?._id && item.store_id?.name) {
            boutiquesMap.set(item.store_id._id, item.store_id.name);
          }
        });
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
      this.filteredAchats = this.achats.filter(achat => {
        // Check root store
        if (achat.store_id?._id === this.boutique_selectionnee) return true;

        // Check items store
        return achat.items?.some((item: any) =>
          item.store_id?._id === this.boutique_selectionnee ||
          item.store_id === this.boutique_selectionnee
        );
      });
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

    if (!img) {
      return '/img/png/elementor-placeholder-image.png';
    }

    const cleanPath = img.replace(/\\/g, '/');
    return `http://localhost:5000/${cleanPath}`;
  }

  // Helper pour parser les Decimal128 dans le HTML
  parseFloat(value: any): number {
    return parseFloat(value);
  }

  // Mettre à jour le statut d'une commande
  updateStatus(id: string, newStatus: string): void {
    const statusLabels: { [key: string]: string } = {
      'CONFIRMEE': 'confirmer',
      'EN_LIVRAISON': 'expédier',
      'DELIVREE': 'livrer',
      'ANNULEE': 'annuler'
    };

    if (confirm(`Voulez-vous vraiment ${statusLabels[newStatus] || 'mettre à jour'} cette commande ?`)) {
      this.achatService.updateStatus(id, newStatus).subscribe({
        next: (response) => {
          console.log('Statut mis à jour:', response);
          // Mettre à jour l'achat localement ou recharger
          const index = this.achats.findIndex(a => a._id === id);
          if (index !== -1) {
            this.achats[index].status = newStatus;
            // Si on a des filtres, mettre à jour filteredAchats aussi
            this.filterByBoutique();
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur mise à jour statut:', err);
          alert(err.error?.message || 'Erreur lors de la mise à jour du statut');
        }
      });
    }
  }

  // Récupérer les transitions possibles selon le statut actuel et le rôle de l'utilisateur
  getTransitions(status: string, avecLivraison: boolean): string[] {
    const currentStatus = status || 'EN_ATTENTE';

    // Si c'est un acheteur, il ne peut modifier que si c'est EN_ATTENTE
    if (this.userRole === 'Acheteur') {
      if (currentStatus === 'EN_ATTENTE') {
        return ['CONFIRMEE', 'ANNULEE'];
      }
      return [];
    }

    // Pour les autres rôles (Boutique, Admin)
    switch (currentStatus) {
      case 'EN_ATTENTE':
        return ['CONFIRMEE', 'ANNULEE'];
      case 'CONFIRMEE':
        return avecLivraison ? ['EN_LIVRAISON', 'ANNULEE'] : ['DELIVREE', 'ANNULEE'];
      case 'EN_LIVRAISON':
        return ['DELIVREE'];
      case 'DELIVREE':
      case 'ANNULEE':
      default:
        return [];
    }
  }

  // Helper pour le label du bouton
  getStatusActionLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'CONFIRMEE': 'Confirmer',
      'EN_LIVRAISON': 'Expédier',
      'DELIVREE': 'Livrer',
      'ANNULEE': 'Annuler'
    };
    return labels[status] || status;
  }

  // Helper pour la couleur du bouton
  getStatusActionColor(status: string): string {
    const colors: { [key: string]: string } = {
      'CONFIRMEE': '#007bff', // Bleu
      'EN_LIVRAISON': '#fd7e14', // Orange
      'DELIVREE': '#28a745', // Vert
      'ANNULEE': '#dc3545' // Rouge
    };
    return colors[status] || '#6c757d';
  }

  // Helper pour récupérer le nom de la boutique
  getNomBoutique(achat: any): string {
    const names = new Set<string>();

    if (achat.store_id?.name) names.add(achat.store_id.name);

    if (achat.items) {
      achat.items.forEach((item: any) => {
        if (item.store_id?.name) names.add(item.store_id.name);
        // Note: The backend populate('items.prod_id') might provide item.prod_id.store_id.name
        if (item.prod_id?.store_id?.name) names.add(item.prod_id.store_id.name);
      });
    }

    if (names.size === 0) return 'Boutique inconnue';
    return Array.from(names).join(', ');
  }
}