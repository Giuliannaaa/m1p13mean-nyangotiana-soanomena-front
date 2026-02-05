import { Injectable } from '@angular/core';
import { environment } from '../../../environnements/environnement';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminDashboard } from '../../models/adminDashboar.model';

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private apiUrl = `${environment.apiUrl}/admin-dashboard`;

  constructor(private http: HttpClient) { }

  getAdminDashboardData(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${this.apiUrl}/data`);
  }

}
