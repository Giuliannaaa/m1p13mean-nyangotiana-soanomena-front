import { Injectable } from '@angular/core';
import { environment } from '../../environnements/environnement';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Boutique } from '../models/boutique.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class BoutiqueService {
  private apiUrl = `${environment.apiUrl}/boutiques`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllBoutiques(): Observable<Boutique[]> {
    return this.http.get<Boutique[]>(`${this.apiUrl}`, { headers: this.getHeaders() });
  }

  // Filtrer par catégorie
  getBoutiquesByCategory(categoryId: string): Observable<Boutique[]> {
    return this.http.get<Boutique[]>(`${this.apiUrl}?categoryId=${categoryId}`, { headers: this.getHeaders() });
  }

  getBoutiqueById(id: string): Observable<Boutique> {
    return this.http.get<Boutique>(`${this.apiUrl}/${id}`);
  }

  createBoutique(boutique: any): Observable<Boutique> {
    return this.http.post<Boutique>(this.apiUrl, boutique);
  }

  updateBoutique(id: string, boutique: any): Observable<Boutique> {
    return this.http.put<Boutique>(`${this.apiUrl}/${id}`, boutique);
  }

  deleteBoutique(id: string): Observable<Boutique> {
    return this.http.delete<Boutique>(`${this.apiUrl}/${id}`);
  }

  validateBoutique(id: string, isValidated: boolean): Observable<Boutique> {
    return this.http.patch<Boutique>(`${this.apiUrl}/${id}/toggle-status`, { isValidated });
  }

  getBoutiqueByOwner(ownerId: string): Observable<Boutique[]> {
    return this.http.get<Boutique[]>(`${this.apiUrl}/owner/${ownerId}`);
  }
}