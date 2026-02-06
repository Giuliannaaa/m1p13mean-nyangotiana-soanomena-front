import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';

@Injectable({ providedIn: 'root' })
export class AchatService {

  private apiUrl = `${environment.apiUrl}/achats`

  constructor(private http: HttpClient) { }

  /*addAchat(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }*/

  addAchat(data: any, prod_id: string): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/ajouter/${prod_id}`, data, { headers });
  }

  getAchats(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  deleteAchat(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }


}
