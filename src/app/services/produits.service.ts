import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produit } from '../models/produit.model';
import { ApiResponse } from '../models/api-response.interface';
@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  private baseUrl = 'http://localhost:5000/api/produits';

  constructor(private http: HttpClient) { }

  getBoutiques(): Observable<any> {
    return this.http.get<ApiResponse<Produit[]>>(`http://localhost:5000/api/auth/boutiques`);
  }

  getProduits(): Observable<ApiResponse<Produit[]>> {
    const token = localStorage.getItem('auth_token'); // ou sessionStorage

    console.log('Token envoyé:', token);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<ApiResponse<Produit[]>>(this.baseUrl, { headers });
  }

  getProduitById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  addProduit(produit: any) {
  const token = localStorage.getItem('auth_token'); // le token JWT
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.post(this.baseUrl, produit, { headers }); // <-- ajoute headers ici
}



  updateProduit(id: string, produit: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, produit);
  }
  deleteProduit(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }


}