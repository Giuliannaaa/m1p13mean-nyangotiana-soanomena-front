import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SignalementService } from '../../services/signalement.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mes-signalements',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mes-signalements.component.html',
  styleUrl: './mes-signalements.component.css'
})
export class MesSignalementsComponent implements OnInit {
  signalements: any[] = [];
  filteredSignalements: any[] = [];
  
  // Filtres
  filtreStatut: string = '';
  searchText: string = '';
  
  // Modal
  selectedSignalement: any = null;
  showModal: boolean = false;
  
  // Loading
  isLoading: boolean = false;
  isAcheteur: boolean = false;

  private signalementService = inject(SignalementService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.isAcheteur = this.authService.getRole() === 'Acheteur';
    
    if (!this.isAcheteur) {
      alert('Vous devez être connecté en tant qu\'acheteur');
      return;
    }
    
    this.loadMesSignalements();
  }

  // Charger tous les signalements et filtrer pour l'utilisateur connecté
  loadMesSignalements(): void {
  this.isLoading = true;
  
  // APPELER LA NOUVELLE ROUTE ACHETEUR AU LIEU DE L'ADMIN
  this.signalementService.getMesSignalements().subscribe({
    next: (response: any) => {
      console.log('Mes signalements:', response);
      this.signalements = response.data || [];
      this.filteredSignalements = this.signalements;
      this.isLoading = false;
      this.cdr.markForCheck();
    },
    error: (err) => {
      console.error('Erreur chargement signalements:', err);
      alert('Erreur lors du chargement de vos signalements');
      this.isLoading = false;
    }
  });
}

  // Filtrer les signalements
  filterSignalements(): void {
    this.filteredSignalements = this.signalements.filter(sig => {
      const matchStatut = !this.filtreStatut || sig.statut === this.filtreStatut;
      const searchLower = this.searchText.toLowerCase();
      const matchSearch = !this.searchText || 
        sig.produit_id?.nom_prod?.toLowerCase().includes(searchLower) ||
        sig.boutique_id?.name?.toLowerCase().includes(searchLower);
      
      return matchStatut && matchSearch;
    });
    
    this.cdr.markForCheck();
  }

  // Réinitialiser les filtres
  resetFilters(): void {
    this.filtreStatut = '';
    this.searchText = '';
    this.filteredSignalements = this.signalements;
    this.cdr.markForCheck();
  }

  // Ouvrir le modal de détail
  openModal(signalement: any): void {
    this.selectedSignalement = signalement;
    this.showModal = true;
  }

  // Fermer le modal
  closeModal(): void {
    this.showModal = false;
    this.selectedSignalement = null;
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

  // Obtenir l'icône du statut
  getStatutIcon(statut: string): string {
    const icons: { [key: string]: string } = {
      'signale': '',
      'en_cours': '',
      'resolu': '',
      'rejete': ''
    };
    return icons[statut] || ' ';
  }
}