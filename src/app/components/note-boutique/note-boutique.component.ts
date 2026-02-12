import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvisService } from '../../services/avis.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-note-boutique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-boutique.component.html',
  styleUrls: ['./note-boutique.component.css']
})
export class NoteBoutiqueComponent implements OnInit {
  @Input() boutiqueId!: string;

  userRating: number = 0;
  comment: string = '';
  avis: any[] = [];
  hasRating: boolean = false;
  isLoading: boolean = false;
  successMessage: string = '';
  canRate: boolean = false;

  private avisService = inject(AvisService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.canRate = this.authService.getRole() === 'Acheteur';
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