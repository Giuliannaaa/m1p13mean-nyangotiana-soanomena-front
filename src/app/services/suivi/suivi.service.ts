import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environnements/environnement';
import { Suivi } from '../../models/suivi.model';

@Injectable({
  providedIn: 'root'
})
export class SuiviService {
  private apiUrl = `${environment.apiUrl}/api/suivis`;

  // Subject pour tracker les boutiques suivies
  private boutiquesSuivies$ = new BehaviorSubject<string[]>([]);

  constructor(private http: HttpClient) {
    this.loadBoutiquesSuivies();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Charger les boutiques suivies de l'acheteur connecté
  loadBoutiquesSuivies(): void {
    this.http.get<any>(`${this.apiUrl}/mes-suivis`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          // console.log('Réponse mes-suivis:', response);

          let ids: string[] = [];

          if (response.data && Array.isArray(response.data)) {
            // CORRECTION : Extraire correctement l'ID de boutique
            ids = response.data.map((suivi: any) => {
              // Si boutique_id est un objet (peuplé), prendre son _id
              if (typeof suivi.boutique_id === 'object' && suivi.boutique_id?._id) {
                // console.log('🔑 boutique_id est un objet, ID:', suivi.boutique_id._id);
                return suivi.boutique_id._id;
              }
              // Sinon, prendre directement la valeur
              console.log('🔑 boutique_id est une string:', suivi.boutique_id);
              return suivi.boutique_id;
            });
          }

          // console.log('IDs des boutiques suivies chargées:', ids);
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
    const result = this.boutiquesSuivies$.value.includes(boutiqueId);
    console.log(`isBoutiqueSuivie(${boutiqueId}):`, result, '- Liste actuelle:', this.boutiquesSuivies$.value);
    return result;
  }

  // Suivre une boutique ET METTRE À JOUR LE SUBJECT
  suivreBoutique(boutiqueId: string): Observable<Suivi> {
    console.log('Appel API: Suivre boutique', boutiqueId);

    return this.http.post<Suivi>(
      `${this.apiUrl}/suivre`,
      { boutique_id: boutiqueId },
      { headers: this.getHeaders() }
    ).pipe(
      tap((response) => {
        console.log('Réponse API Suivre:', response);

        // AJOUTER À LA LISTE DES SUIVIS
        const currentIds = this.boutiquesSuivies$.value;
        console.log('AVANT l\'ajout:', currentIds);

        if (!currentIds.includes(boutiqueId)) {
          const newIds = [...currentIds, boutiqueId];
          console.log('APRÈS l\'ajout:', newIds);
          this.boutiquesSuivies$.next(newIds);
        } else {
          console.log('Boutique déjà dans la liste');
        }
      })
    );
  }

  // Arrêter de suivre une boutique ET METTRE À JOUR LE SUBJECT
  arreterSuivreBoutique(boutiqueId: string): Observable<any> {
    console.log('Appel API: Arrêter de suivre boutique', boutiqueId);

    return this.http.delete(
      `${this.apiUrl}/arreter-suivi/${boutiqueId}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap((response) => {
        console.log('Réponse API Arrêter:', response);

        // ENLEVER DE LA LISTE DES SUIVIS
        const currentIds = this.boutiquesSuivies$.value;
        console.log('AVANT la suppression:', currentIds);

        const newIds = currentIds.filter(id => id !== boutiqueId);
        console.log('APRÈS la suppression:', newIds);
        this.boutiquesSuivies$.next(newIds);
      })
    );
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