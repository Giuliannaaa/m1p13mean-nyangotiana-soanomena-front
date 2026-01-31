import { Injectable } from '@angular/core';
import { environment } from '../../environnements/environnement';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Boutique } from '../models/boutique.model';

@Injectable({
  providedIn: 'root',
})
export class BoutiqueService {
  private apiUrl = `${environment.apiUrl}/boutiques`;

  constructor(private http: HttpClient) { }

  getAllBoutiques(): Observable<Boutique[]> {
    return this.http.get<Boutique[]>(this.apiUrl);
  }

  getBoutiqueById(id: string): Observable<Boutique> {
    return this.http.get<Boutique>(`${this.apiUrl}/${id}`);
  }

  createBoutique(boutique: Boutique): Observable<Boutique> {
    return this.http.post<Boutique>(this.apiUrl, boutique);
  }

  updateBoutique(id: string, boutique: Boutique): Observable<Boutique> {
    return this.http.put<Boutique>(`${this.apiUrl}/${id}`, boutique);
  }

  deleteBoutique(id: string): Observable<Boutique> {
    return this.http.delete<Boutique>(`${this.apiUrl}/${id}`);
  }
}
