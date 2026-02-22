import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignalementService } from '../../services/signalement.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-signalement-boutique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signalement-boutique.component.html',
  styleUrl: './signalement-boutique.component.css'
})
export class SignalementBoutiqueComponent implements OnInit {
  signalements: any[] = [];
  filteredSignalements: any[] = [];

  isLoading: boolean = false;

  // Filtres
  selectedStatus: string = '';
  searchText: string = '';

  // Modal détail
  showModal: boolean = false;
  selectedSignalement: any = null;

  private signalementService = inject(SignalementService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadSignalements();
  }

  // CHARGER LES SIGNALEMENTS DE LA BOUTIQUE
  loadSignalements(): void {
    this.isLoading = true;

    this.signalementService.getMesSignalementsBoutique().subscribe({
      next: (response: any) => {
        // console.log('Signalements reçus:', response);
        this.signalements = response.data || [];
        this.filteredSignalements = this.signalements;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement signalements:', err);
        this.isLoading = false;
      }
    });
  }

  // FILTRER LES SIGNALEMENTS
  filterSignalements(): void {
    this.filteredSignalements = this.signalements.filter(sig => {
      // Filtre par statut
      const matchStatus = !this.selectedStatus || sig.statut === this.selectedStatus;

      // Filtre par recherche (produit, acheteur)
      const searchLower = this.searchText.toLowerCase();
      const matchSearch = !this.searchText ||
        (sig.produit_id?.nom_prod?.toLowerCase().includes(searchLower)) ||
        (sig.acheteur_id?.firstname?.toLowerCase().includes(searchLower)) ||
        (sig.acheteur_id?.lastname?.toLowerCase().includes(searchLower));

      return matchStatus && matchSearch;
    });
  }

  // OUVRIR MODAL DÉTAIL
  openModal(signalement: any): void {
    this.selectedSignalement = signalement;
    this.showModal = true;
  }

  // FERMER MODAL
  closeModal(): void {
    this.showModal = false;
    this.selectedSignalement = null;
  }

  // OBTENIR LA COULEUR DU STATUT
  getStatutColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'signale': '#ffc107',      // Jaune
      'en_cours': '#17a2b8',     // Bleu
      'resolu': '#28a745',       // Vert
      'rejete': '#dc3545'        // Rouge
    };
    return colors[statut] || '#6c757d';
  }

  // OBTENIR LE LABEL DU STATUT
  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'signale': 'Signalé',
      'en_cours': 'En cours de traitement',
      'resolu': 'Résolu',
      'rejete': 'Rejeté'
    };
    return labels[statut] || statut;
  }

  // OBTENIR LE LABEL DE LA RAISON
  getRaisonLabel(raison: string): string {
    const labels: { [key: string]: string } = {
      'produit_defectueux': 'Produit défectueux',
      'description_inexacte': 'Description inexacte',
      'prix_incorrect': 'Prix incorrect',
      'contenu_offensant': 'Contenu offensant',
      'produit_non_conforme': 'Produit non conforme',
      'arnaque': 'Arnaque/Escroquerie',
      'autre': 'Autre'
    };
    return labels[raison] || raison;
  }

  // FORMATER LA DATE
  formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}