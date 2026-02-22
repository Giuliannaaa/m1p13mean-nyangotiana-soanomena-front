import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtenir les catégories
  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/categories`, { headers: this.getHeaders() });
  }

  // Obtenir les boutiques par catégorie
  getBoutiquesByCategory(categoryId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/api/boutiques/categorie/${categoryId}`,
      { headers: this.getHeaders() }
    );
  }

  // Obtenir les nouvelles boutiques
  getNewBoutiques(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/api/boutiques/nouveau`,
      { headers: this.getHeaders() }
    );
  }

  // Obtenir les meilleures ventes (produits)
  getBestSellerProducts(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/api/produits/best-sellers`,
      { headers: this.getHeaders() }
    );
  }

  // Obtenir les promotions actuelles
  getActivePromotions(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/promotions/actives`,
      { headers: this.getHeaders() }
    );
  }

  // Obtenir les avis sur les boutiques
  getBoutiqueReviews(boutiqueId?: string): Observable<any> {
    let url = `${this.apiUrl}/api/avis`;
    if (boutiqueId) {
      url += `?boutique_id=${boutiqueId}`;
    }
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // Obtenir les statistiques du dashboard
  getDashboardStats(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/api/dashboard/stats`,
      { headers: this.getHeaders() }
    );
  }
}