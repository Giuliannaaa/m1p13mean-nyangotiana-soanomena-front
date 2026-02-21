import { Injectable } from '@angular/core';
import { environment } from '../../../environnements/environnement';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BoutiqueDashboardService {
  private apiUrl = `${environment.apiUrl}/boutique-dashboard`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // for store owner
  getStoreRevenue(month?: number, year?: number): Observable<any> {
    let params: any = {};
    if (month) params['month'] = month;
    if (year) params['year'] = year;
    return this.http.get<any>(`${this.apiUrl}/my-store-revenue`, { headers: this.getHeaders(), params });
  }

  // for store owner
  getNumberOfProductInMyStore(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/number-of-product-in-my-store`, { headers: this.getHeaders() });
  }


  // for store owner - produits en rupture de stock
  getOutOfStockProducts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/out-of-stock-products`, { headers: this.getHeaders() });
  }

  // for store owner - top 5 produits les plus vendus
  getTopSellingProducts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/top-selling-products`, { headers: this.getHeaders() });
  }

  // for store owner - promotions actives
  getActivePromotionsInMyStore(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/active-promotions-in-my-store`, { headers: this.getHeaders() });
  }

  // Revenue annuel des boutiques
  getAnnualRevenueByOwner(month?: number, year?: number): Observable<any> {
    let params: any = {};
    if (month) params['month'] = month;
    if (year) params['year'] = year;
    return this.http.get<any>(`${this.apiUrl}/annual-revenue-by-owner`, { headers: this.getHeaders(), params });
  }

  getMonthlyRevenueByProduct(month?: number, year?: number): Observable<any> {
    let params: any = {};
    if (month) params['month'] = month;
    if (year) params['year'] = year;

    return this.http.get<any>(`${this.apiUrl}/monthly-revenue-by-product`, { headers: this.getHeaders(), params });
  }
}
