import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignalementService } from '../../services/signalement.service';

@Component({
  selector: 'app-signaler-produit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signalement-produit.component.html',
  styleUrls: ['./signalement-produit.component.css']
})
export class SignalerProduitComponent implements OnInit {
  @Input() produitId!: string;

  raison: string = '';
  description: string = '';
  hasSignale: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  private signalementService = inject(SignalementService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.checkMonSignalement();
  }

  checkMonSignalement(): void {
    if (!this.produitId) return;

    this.signalementService.getMonSignalement(this.produitId).subscribe({
      next: (response: any) => {
        if (response.data) {
          this.hasSignale = true;
          this.raison = response.data.raison;
        }
      },
      error: (err) => {
        console.log('Pas de signalement pour ce produit');
      }
    });
  }

  envoyer(): void {
    if (!this.raison || !this.description) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.signalementService.creerSignalement(
      this.produitId,
      this.raison,
      this.description
    ).subscribe({
      next: () => {
        this.hasSignale = true;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur signalement:', err);
        this.errorMessage = err.error?.message || 'Erreur lors du signalement';
        this.isLoading = false;
      }
    });
  }

  resetFormulaire(): void {
    this.raison = '';
    this.description = '';
    this.hasSignale = false;
    this.errorMessage = '';
  }

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
}