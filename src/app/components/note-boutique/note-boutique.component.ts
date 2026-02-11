import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvisService } from '../../services/avis.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-note-boutique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
      <h4>Évaluer cette boutique</h4>
      
      <!-- Affichage de la note actuelle -->
      <div style="margin-bottom: 15px;">
        <p style="font-size: 14px; color: #fff; margin-bottom: 8px;">Votre avis :</p>
        
        <!-- Étoiles cliquables -->
        <div style="display: flex; gap: 8px; align-items: center;">
          @for (star of [1,2,3,4,5]; track star) {
            <button
              (click)="setRating(star)"
              style="
                font-size: 24px;
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
                transition: transform 0.2s;
              "
              [style.transform]="'scale(' + (userRating >= star ? 1.2 : 1) + ')'"
              [title]="'Noter ' + star + ' étoile(s)'"
            >
              {{ userRating >= star ? '⭐' : '☆' }}
            </button>
          }
          @if (userRating > 0) {
            <span style="margin-left: 10px; font-weight: bold; color: #ffc107;">
              {{ userRating }}/5
            </span>
          }
        </div>
      </div>

      <!-- Commentaire -->
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: bold;">
          Commentaire (optionnel)
        </label>
        <textarea
          [(ngModel)]="comment"
          placeholder="Partagez votre expérience avec cette boutique..."
          style="
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            font-family: Arial, sans-serif;
            resize: vertical;
            min-height: 80px;
          "
        ></textarea>
      </div>

      <!-- Boutons -->
      <div style="display: flex; gap: 10px;">
        <button
          (click)="envoyer()"
          [disabled]="userRating === 0 || isLoading"
          style="
            flex: 1;
            padding: 10px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
          "
          [style.opacity]="userRating === 0 || isLoading ? '0.5' : '1'"
        >
          {{ isLoading ? 'Envoi...' : 'Envoyer mon avis' }}
        </button>
        
        @if (hasRating) {
          <button
            (click)="supprimer()"
            [disabled]="isLoading"
            style="
              padding: 10px 15px;
              background-color: #dc3545;
              color: white;
              border: none;
              border-radius: 4px;
              font-weight: bold;
              cursor: pointer;
              font-size: 14px;
            "
          >
            Supprimer
          </button>
        }
      </div>

      <!-- Message de succès -->
      @if (successMessage) {
        <div style="
          margin-top: 10px;
          padding: 10px;
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 4px;
          color: #155724;
          font-size: 14px;
        ">
          ✓ {{ successMessage }}
        </div>
      }

      <!-- Avis des autres -->
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
        <h5>Avis des autres clients</h5>
        @if (avis.length > 0) {
          <div style="max-height: 300px; overflow-y: auto;">
            @for (item of avis; track item._id) {
              <div style="padding: 10px; border-bottom: 1px solid #eee;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                  <strong style="font-size: 14px;">{{ item.acheteur_id?.firstname }} {{ item.acheteur_id?.lastname }}</strong>
                  <span style="color: #ffc107; font-size: 14px;">
                    @for (star of [1,2,3,4,5]; track star) {
                      {{ item.rating >= star ? '⭐' : '☆' }}
                    }
                  </span>
                </div>
                @if (item.comment) {
                  <p style="font-size: 12px; color: #666; margin: 5px 0; font-style: italic;">
                    "{{ item.comment }}"
                  </p>
                }
              </div>
            }
          </div>
        } @else {
          <p style="font-size: 14px; color: #999; font-style: italic;">
            Aucun avis pour le moment
          </p>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class NoteBoutiqueComponent implements OnInit {
  @Input() boutiqueId!: string;

  userRating: number = 0;
  comment: string = '';
  avis: any[] = [];
  hasRating: boolean = false;
  isLoading: boolean = false;
  successMessage: string = '';

  private avisService = inject(AvisService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadMonAvis();
    this.loadAvis();
  }

  loadMonAvis(): void {
    this.avisService.getMonAvis(this.boutiqueId).subscribe({
      next: (response: any) => {
        if (response.data) {
          this.userRating = response.data.rating;
          this.comment = response.data.comment || '';
          this.hasRating = true;
        }
      },
      error: (err) => {
        console.error('Erreur chargement avis:', err);
      }
    });
  }

  loadAvis(): void {
    this.avisService.getAvisBoutique(this.boutiqueId).subscribe({
      next: (response: any) => {
        this.avis = response.data || [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement avis boutique:', err);
      }
    });
  }

  setRating(rating: number): void {
    this.userRating = this.userRating === rating ? 0 : rating;
  }

  envoyer(): void {
    if (this.userRating === 0) {
      alert('Veuillez sélectionner une note');
      return;
    }

    this.isLoading = true;
    this.avisService.noterBoutique(this.boutiqueId, this.userRating, this.comment).subscribe({
      next: () => {
        this.successMessage = 'Votre avis a été enregistré !';
        this.hasRating = true;
        this.loadAvis();
        this.isLoading = false;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur envoi avis:', err);
        alert('Erreur lors de l\'envoi de votre avis');
        this.isLoading = false;
      }
    });
  }

  supprimer(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre avis ?')) {
      this.isLoading = true;
      this.avisService.supprimerAvis(this.boutiqueId).subscribe({
        next: () => {
          this.userRating = 0;
          this.comment = '';
          this.hasRating = false;
          this.successMessage = 'Votre avis a été supprimé';
          this.loadAvis();
          this.isLoading = false;
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur suppression avis:', err);
          alert('Erreur lors de la suppression');
          this.isLoading = false;
        }
      });
    }
  }
}