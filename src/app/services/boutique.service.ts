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

  getAllBoutiques(): Observable<Boutique[]> {
    const token = localStorage.getItem('auth_token'); // ou sessionStorage

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Boutique[]>(`${this.apiUrl}`, { headers });
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
    // Assuming there's a backend endpoint, otherwise we'd use getAllBoutiques and filter
    return this.http.get<Boutique[]>(`${this.apiUrl}/owner/${ownerId}`);
  }
}
