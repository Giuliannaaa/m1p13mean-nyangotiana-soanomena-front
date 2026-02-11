import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignalementService } from '../../services/signalement.service';

@Component({
  selector: 'app-signaler-produit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin-top: 20px;">
      <h4 style="color: #dc3545; margin-top: 0;">Signaler un problème</h4>
      
      <!-- Formulaire de signalement -->
      @if (!hasSignale) {
        <div>
          <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
            Si vous avez un problème avec ce produit, veuillez le signaler aux administrateurs
          </p>

          <!-- Raison du signalement -->
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 8px; font-weight: bold; font-size: 14px;">
              Raison du signalement *
            </label>
            <select
              [(ngModel)]="raison"
              style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
              "
            >
              <option value="">-- Sélectionnez une raison --</option>
              <option value="produit_defectueux">Produit défectueux</option>
              <option value="description_inexacte">Description inexacte</option>
              <option value="prix_incorrect">Prix incorrect</option>
              <option value="contenu_offensant">Contenu offensant</option>
              <option value="produit_non_conforme">Produit non conforme</option>
              <option value="arnaque">Arnaque/Escroquerie</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <!-- Description du problème -->
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 8px; font-weight: bold; font-size: 14px;">
              Description du problème *
            </label>
            <textarea
              [(ngModel)]="description"
              placeholder="Décrivez le problème en détail (max 1000 caractères)..."
              maxlength="1000"
              style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                font-family: Arial, sans-serif;
                resize: vertical;
                min-height: 100px;
              "
            ></textarea>
            <p style="font-size: 12px; color: #999; margin-top: 5px;">
              {{ description.length }}/1000
            </p>
          </div>

          <!-- Bouton d'envoi -->
          <div style="display: flex; gap: 10px;">
            <button
              (click)="envoyer()"
              [disabled]="!raison || !description || isLoading"
              style="
                flex: 1;
                padding: 10px;
                background-color: #dc3545;
                color: white;
                border: none;
                border-radius: 4px;
                font-weight: bold;
                cursor: pointer;
                font-size: 14px;
              "
              [style.opacity]="!raison || !description || isLoading ? '0.5' : '1'"
            >
              {{ isLoading ? 'Envoi...' : 'Envoyer le signalement' }}
            </button>
          </div>
        </div>
      }

      <!-- Message après signalement -->
      @if (hasSignale) {
        <div style="
          padding: 15px;
          border: 1px solid #c3e6cb;
          border-radius: 4px;
          color: #155724;
        ">
          <h5 style="margin-top: 0;">✓ Signalement enregistré</h5>
          <p style="margin: 10px 0; font-size: 14px;">
            Raison: <strong>{{ getRaisonLabel(raison) }}</strong>
          </p>
          <p style="margin: 10px 0; font-size: 14px;">
            Statut: <strong style="color: #ff6b6b;">En attente de traitement</strong>
          </p>
          <p style="margin: 10px 0; font-size: 12px; font-style: italic;">
            Les administrateurs examineront votre signalement et prendront les mesures appropriées.
          </p>
          <button
            (click)="resetFormulaire()"
            style="
              padding: 8px 15px;
              background-color: #28a745;
              color: white;
              border: none;
              border-radius: 4px;
              font-weight: bold;
              cursor: pointer;
              font-size: 14px;
              margin-top: 10px;
            "
          >
            Signaler un autre problème
          </button>
        </div>
      }

      <!-- Message d'erreur -->
      @if (errorMessage) {
        <div style="
          padding: 15px;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          color: #721c24;
          margin-top: 10px;
        ">
          <strong>Erreur:</strong> {{ errorMessage }}
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
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