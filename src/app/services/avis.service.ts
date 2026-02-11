import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';

@Injectable({
  providedIn: 'root'
})
export class AvisService {
  private apiUrl = `${environment.apiUrl}/api/avis`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Noter une boutique
  noterBoutique(boutiqueId: string, rating: number, comment?: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/noter`,
      { 
        boutique_id: boutiqueId, 
        rating,
        comment: comment || ''
      },
      { headers: this.getHeaders() }
    );
  }

  // Obtenir mon avis pour une boutique
  getMonAvis(boutiqueId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/mon-avis/${boutiqueId}`,
      { headers: this.getHeaders() }
    );
  }

  // Obtenir tous les avis d'une boutique
  getAvisBoutique(boutiqueId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/boutique/${boutiqueId}`,
      { headers: this.getHeaders() }
    );
  }

  // Supprimer un avis
  supprimerAvis(boutiqueId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${boutiqueId}`,
      { headers: this.getHeaders() }
    );
  }
}