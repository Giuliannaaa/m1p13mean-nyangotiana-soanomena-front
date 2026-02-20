import { Injectable } from '@angular/core';
import { environment } from '../../../environnements/environnement';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminDashboard } from '../../models/adminDashboar.model';

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private apiUrl = `${environment.apiUrl}/admin-dashboard`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAdminDashboardData(): Observable<AdminDashboard> {
    console.log(this.http.get<AdminDashboard>(`${this.apiUrl}/data`, { headers: this.getHeaders() }));

    return this.http.get<AdminDashboard>(`${this.apiUrl}/data`, { headers: this.getHeaders() });
  }

  // for Admin
  getRevenuePerStore(year?: number, month?: number): Observable<any[]> {
    let params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;

    return this.http.get<any[]>(`${this.apiUrl}/revenue-per-store`, { headers: this.getHeaders(), params });
  }

  // for Admin
  getStoreCountByCategory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/store-count-by-category`, { headers: this.getHeaders() });
  }


  // for admin
  getTop5Stores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-5-stores`, { headers: this.getHeaders() });
  }

}
