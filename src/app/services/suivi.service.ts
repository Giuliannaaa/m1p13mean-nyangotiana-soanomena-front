import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environnements/environnement';
import { Suivi } from '../models/suivi.model';

@Injectable({
  providedIn: 'root'
})
export class SuiviService {
  private apiUrl = `${environment.apiUrl}/suivis`;
  
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
          const ids = response.data?.map((suivi: Suivi) => suivi.boutique_id) || [];
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

  // Suivre une boutique
  suivreBoutique(boutiqueId: string): Observable<Suivi> {
    return this.http.post<Suivi>(
      `${this.apiUrl}/suivre`,
      { boutique_id: boutiqueId },
      { headers: this.getHeaders() }
    );
  }

  // Arrêter de suivre une boutique
  arreterSuivreBoutique(boutiqueId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/arreter-suivi/${boutiqueId}`,
      { headers: this.getHeaders() }
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