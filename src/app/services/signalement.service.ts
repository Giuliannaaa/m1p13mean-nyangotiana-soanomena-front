import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';

@Injectable({
  providedIn: 'root'
})
export class SignalementService {
  private apiUrl = `${environment.apiUrl}/api/signalements`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Créer un signalement
  creerSignalement(produitId: string, raison: string, description: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/creer`,
      { 
        produit_id: produitId, 
        raison,
        description
      },
      { headers: this.getHeaders() }
    );
  }

  // Obtenir mon signalement pour un produit
  getMonSignalement(produitId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/mon-signalement/${produitId}`,
      { headers: this.getHeaders() }
    );
  }

  // Admin : Obtenir tous les signalements
  getTousSignalements(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/admin/tous`,
      { headers: this.getHeaders() }
    );
  }

  // Admin : Obtenir les signalements d'une boutique
  getSignalementsBoutique(boutiqueId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/admin/boutique/${boutiqueId}`,
      { headers: this.getHeaders() }
    );
  }

  // Admin : Mettre à jour le statut
  updateStatusSignalement(signalementId: string, statut: string, reponseAdmin?: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/admin/${signalementId}/status`,
      { 
        statut,
        reponse_admin: reponseAdmin || null
      },
      { headers: this.getHeaders() }
    );
  }

  // Admin : Supprimer un signalement
  supprimerSignalement(signalementId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/admin/${signalementId}`,
      { headers: this.getHeaders() }
    );
  }

  // Admin : Obtenir les statistiques
  getStatistiquesSignalements(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/admin/stats`,
      { headers: this.getHeaders() }
    );
  }

  // Obtenir mes signalements (Acheteur)
  getMesSignalements(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/acheteur/mes-signalements`,
      { headers: this.getHeaders() }
    );
  }
}