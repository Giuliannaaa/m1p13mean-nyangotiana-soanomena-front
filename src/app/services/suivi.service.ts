import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environnements/environnement';
import { Suivi } from '../models/suivi.model';
import { AuthService } from './auth.service'; 

@Injectable({
  providedIn: 'root'
})
export class SuiviService {
  private apiUrl = `${environment.apiUrl}/api/suivis`;
  
  private boutiquesSuivies$ = new BehaviorSubject<string[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Charger les suivis seulement si connecté
    if (this.authService.isAuthenticated()) {
      this.loadBoutiquesSuivies();
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // CHARGER LES BOUTIQUES SUIVIES ET METTRE À JOUR LE SUBJECT
  loadBoutiquesSuivies(): void {
    this.http.get<any>(`${this.apiUrl}/mes-suivis`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          console.log('Réponse mes-suivis:', response);
          
          // Gérer différents formats de réponse
          let ids: string[] = [];
          
          if (response.data && Array.isArray(response.data)) {
            // Format: { data: [ { boutique_id: "...", ... }, ... ] }
            ids = response.data.map((suivi: any) => {
              // Si boutique_id est un objet, prendre son _id
              if (typeof suivi.boutique_id === 'object' && suivi.boutique_id._id) {
                return suivi.boutique_id._id;
              }
              // Sinon, prendre directement la valeur
              return suivi.boutique_id;
            });
          }
          
          console.log('IDs des boutiques suivies:', ids);
          // METTRE À JOUR LE SUBJECT
          this.boutiquesSuivies$.next(ids);
        },
        error: (err) => {
          console.error('Erreur chargement suivis:', err);
          this.boutiquesSuivies$.next([]);
        }
      });
  }

  // Obtenir le Subject des boutiques suivies
  getBoutiquesSuivies(): Observable<string[]> {
    return this.boutiquesSuivies$.asObservable();
  }

  // Vérifier si une boutique est suivie
  isBoutiqueSuivie(boutiqueId: string): boolean {
    return this.boutiquesSuivies$.value.includes(boutiqueId);
  }

  // SUIVRE UNE BOUTIQUE ET METTRE À JOUR LE SUBJECT
  suivreBoutique(boutiqueId: string): Observable<Suivi> {
    console.log('Appel API POST:', `${this.apiUrl}/suivre`);
    console.log('Boutique ID:', boutiqueId);
    
    return new Observable(observer => {
      this.http.post<Suivi>(
        `${this.apiUrl}/suivre`,
        { boutique_id: boutiqueId },
        { headers: this.getHeaders() }
      ).subscribe({
        next: (response) => {
          console.log('Suivi réussi:', response);
          
          // AJOUTER À LA LISTE DES SUIVIS
          const currentIds = this.boutiquesSuivies$.value;
          if (!currentIds.includes(boutiqueId)) {
            this.boutiquesSuivies$.next([...currentIds, boutiqueId]);
          }
          
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          console.error('Erreur suivre boutique:', err);
          observer.error(err);
        }
      });
    });
  }

  // ARRÊTER DE SUIVRE ET METTRE À JOUR LE SUBJECT
  arreterSuivreBoutique(boutiqueId: string): Observable<any> {
    return new Observable(observer => {
      this.http.delete(
        `${this.apiUrl}/arreter-suivi/${boutiqueId}`,
        { headers: this.getHeaders() }
      ).subscribe({
        next: (response) => {
          console.log('Arrêt du suivi réussi:', response);
          
          // ENLEVER DE LA LISTE DES SUIVIS
          const currentIds = this.boutiquesSuivies$.value;
          this.boutiquesSuivies$.next(
            currentIds.filter(id => id !== boutiqueId)
          );
          
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          console.error('Erreur arrêt suivi:', err);
          observer.error(err);
        }
      });
    });
  }

  // Obtenir tous les suivis de l'acheteur
  getMesSuivis(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mes-suivis`, { headers: this.getHeaders() });
  }

  // Obtenir le nombre de followers d'une boutique
  getNombreFollowers(boutiqueId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/boutique/${boutiqueId}/followers`);
  }
}