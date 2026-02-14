import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produit } from '../../models/produit.model';
import { ApiResponse } from '../../models/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  private baseUrl = 'http://localhost:5000/api/produits';

  constructor(private http: HttpClient) { }

  // ✅ Récupérer les headers avec le token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getBoutiques(): Observable<any> {
    return this.http.get<ApiResponse<Produit[]>>(`http://localhost:5000/api/auth/boutiques`);
  }

  getProduits(): Observable<ApiResponse<Produit[]>> {
    return this.http.get<ApiResponse<Produit[]>>(this.baseUrl, { headers: this.getHeaders() });
  }

  getProduitById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Filtrer par boutique
  getProduitsByBoutique(store_id: string): Observable<ApiResponse<Produit[]>> {
    return this.http.get<ApiResponse<Produit[]>>(
      `${this.baseUrl}/store/${store_id}`,
      { headers: this.getHeaders() }
    );
  }

  // Filtres avancés
  getNewProduits(): Observable<ApiResponse<Produit[]>> {
    return this.http.get<ApiResponse<Produit[]>>(
      `${this.baseUrl}/filter/new`,
      { headers: this.getHeaders() }
    );
  }

  getPopularProduits(): Observable<ApiResponse<Produit[]>> {
    return this.http.get<ApiResponse<Produit[]>>(
      `${this.baseUrl}/filter/popular`,
      { headers: this.getHeaders() }
    );
  }

  getBestSellerProduits(): Observable<ApiResponse<Produit[]>> {
    return this.http.get<ApiResponse<Produit[]>>(
      `${this.baseUrl}/filter/bestseller`,
      { headers: this.getHeaders() }
    );
  }

  getPromotedProduits(): Observable<ApiResponse<Produit[]>> {
    return this.http.get<ApiResponse<Produit[]>>(
      `${this.baseUrl}/filter/promoted`,
      { headers: this.getHeaders() }
    );
  }

  addProduit(produit: any): Observable<any> {
    return this.http.post(this.baseUrl, produit, { headers: this.getHeaders() });
  }

  updateProduit(id: string, produit: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, produit, { headers: this.getHeaders() });
  }

  deleteProduit(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  updatePrixProduit(id: string, prix: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-prix-produit/${id}`, { prix_unitaire: prix }, { headers: this.getHeaders() });
  }
}