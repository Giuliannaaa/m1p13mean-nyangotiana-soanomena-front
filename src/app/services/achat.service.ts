import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';

@Injectable({ providedIn: 'root' })
export class AchatService {

  private apiUrl = `${environment.apiUrl}/achats`

  constructor(private http: HttpClient) {}

  addAchat(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getAchats(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  deleteAchat(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }


}
