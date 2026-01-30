import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ProduitService {


  // mettre ici le port du backend
  private baseUrl = 'http://localhost:5000/api/produits';

  //private apiUrl = 'http://localhost:5000/produits'; //vous pouvez modifier le port
  constructor(private http: HttpClient) { }

  getBoutiques(): Observable<any> {
    return this.http.get<any>('http://localhost:5000/api/auth/boutiques');
  }

  getProduits(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }
  getProduitById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  addProduit(produit: any) {
    return this.http.post('http://localhost:5000/api/produits', produit);
  }


  updateProduit(id: string, produit: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, produit);
  }
  deleteProduit(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }


}