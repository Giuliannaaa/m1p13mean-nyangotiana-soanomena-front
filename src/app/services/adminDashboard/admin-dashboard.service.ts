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
    return this.http.get<AdminDashboard>(`${this.apiUrl}/data`, { headers: this.getHeaders() });
  }

  // for Admin
  getRevenuePerStore(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/revenue-per-store`, { headers: this.getHeaders() });
  }

  // for Admin
  getStoreCountByCategory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/store-count-by-category`, { headers: this.getHeaders() });
  }

  // for store owner
  getStoreRevenue(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-store-revenue`, { headers: this.getHeaders() });
  }

  // for admin
  getTop5Stores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-5-stores`, { headers: this.getHeaders() });
  }

  // for store owner
  getNumberOfProductInMyStore(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/number-of-product-in-my-store`, { headers: this.getHeaders() });
  }
}
