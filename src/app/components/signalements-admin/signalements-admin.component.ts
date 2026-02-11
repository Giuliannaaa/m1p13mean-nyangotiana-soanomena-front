import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SignalementService } from '../../services/signalement.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-signalements-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './signalements-admin.component.html',
  styleUrl: './signalements-admin.component.css'
})
export class SignalementsAdminComponent implements OnInit {
  signalements: any[] = [];
  filteredSignalements: any[] = [];

  // Filtres
  filtreStatut: string = '';
  filtreRaison: string = '';
  searchText: string = '';

  // Modal
  selectedSignalement: any = null;
  showModal: boolean = false;
  newStatut: string = '';
  reponse: string = '';

  // Loading
  isLoading: boolean = false;
  isSaving: boolean = false;

  isAdmin: boolean = false;

  private signalementService = inject(SignalementService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.isAdmin = this.authService.getRole() === 'Admin';

    if (!this.isAdmin) {
      alert('Accès refusé');
      return;
    }

    this.loadSignalements();
  }

  loadSignalements(): void {
    this.isLoading = true;
    this.signalementService.getTousSignalements().subscribe({
      next: (response: any) => {
        console.log('Signalements reçus:', response);
        this.signalements = response.data || [];
        this.filteredSignalements = this.signalements;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement signalements:', err);
        alert('Erreur lors du chargement des signalements');
        this.isLoading = false;
      }
    });
  }

  // Filtrer les signalements
  filterSignalements(): void {
    this.filteredSignalements = this.signalements.filter(sig => {
      const matchStatut = !this.filtreStatut || sig.statut === this.filtreStatut;
      const matchRaison = !this.filtreRaison || sig.raison === this.filtreRaison;
      const searchLower = this.searchText.toLowerCase();
      const matchSearch = !this.searchText ||
        sig.produit_id?.nom_prod?.toLowerCase().includes(searchLower) ||
        sig.acheteur_id?.firstname?.toLowerCase().includes(searchLower) ||
        sig.acheteur_id?.lastname?.toLowerCase().includes(searchLower) ||
        sig.boutique_id?.name?.toLowerCase().includes(searchLower);

      return matchStatut && matchRaison && matchSearch;
    });

    this.cdr.markForCheck();
  }

  // Réinitialiser les filtres
  resetFilters(): void {
    this.filtreStatut = '';
    this.filtreRaison = '';
    this.searchText = '';
    this.filteredSignalements = this.signalements;
    this.cdr.markForCheck();
  }

  // Ouvrir le modal de détail
  openModal(signalement: any): void {
    this.selectedSignalement = signalement;
    this.newStatut = signalement.statut;
    this.reponse = signalement.reponse_admin || '';
    this.showModal = true;
  }

  // Fermer le modal
  closeModal(): void {
    this.showModal = false;
    this.selectedSignalement = null;
    this.newStatut = '';
    this.reponse = '';
  }

  // Mettre à jour le statut du signalement
  updateStatus(): void {
    if (!this.selectedSignalement) return;

    this.isSaving = true;
    this.signalementService.updateStatusSignalement(
      this.selectedSignalement._id,
      this.newStatut,
      this.reponse
    ).subscribe({
      next: (response: any) => {
        console.log('Statut mis à jour:', response);
        alert('Signalement mis à jour avec succès');

        // Mettre à jour la liste
        const index = this.signalements.findIndex(s => s._id === this.selectedSignalement._id);
        if (index !== -1) {
          this.signalements[index] = response.data;
        }

        this.filterSignalements();
        this.closeModal();
        this.isSaving = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur mise à jour:', err);
        alert('Erreur lors de la mise à jour');
        this.isSaving = false;
      }
    });
  }

  // Supprimer un signalement
  deleteSignalement(signalementId: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) {
      return;
    }

    this.signalementService.supprimerSignalement(signalementId).subscribe({
      next: () => {
        alert('Signalement supprimé');
        this.signalements = this.signalements.filter(s => s._id !== signalementId);
        this.filterSignalements();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        alert('Erreur lors de la suppression');
      }
    });
  }

  // Obtenir le label de la raison
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

  // Obtenir le badge de statut
  getStatutBadgeColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'signale': '#ff6b6b',
      'en_cours': '#ffa94d',
      'resolu': '#51cf66',
      'rejete': '#868e96'
    };
    return colors[statut] || '#007bff';
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'signale': 'Signalé',
      'en_cours': 'En cours',
      'resolu': 'Résolu',
      'rejete': 'Rejeté'
    };
    return labels[statut] || statut;
  }
}