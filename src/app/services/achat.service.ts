import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';

@Injectable({ providedIn: 'root' })
export class AchatService {

  private apiUrl = `${environment.apiUrl}/achats`;

  constructor(private http: HttpClient) { }

  // Récupérer le token du localStorage
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  addAchat(data: any, prod_id: string): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/ajouter/${prod_id}`, data, { headers });
  }

  getAchats(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  getAchatById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateAchat(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteAchat(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}