import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PanierService {
    private apiUrl = `${environment.apiUrl}/api/panier`;
    private cartUpdateSource = new Subject<void>();
    cartUpdate$ = this.cartUpdateSource.asObservable();

    constructor(private http: HttpClient) { }

    notifyCartUpdate() {
        this.cartUpdateSource.next();
    }

    getPanier(): Observable<any> {
        const token = localStorage.getItem('auth_token');

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<any>(this.apiUrl, { headers });
    }

    addToPanier(productId: string, quantity: number): Observable<any> {
        const token = localStorage.getItem('auth_token');

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.post<any>(`${this.apiUrl}/add`, { productId, quantity }, { headers });
    }

    updateItemQuantity(productId: string, quantity: number): Observable<any> {
        const token = localStorage.getItem('auth_token');

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.put<any>(`${this.apiUrl}/update`, { productId, quantity }, { headers });
    }

    removeFromPanier(productId: string): Observable<any> {
        const token = localStorage.getItem('auth_token');

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.delete<any>(`${this.apiUrl}/remove/${productId}`, { headers });
    }

    clearPanier(): Observable<any> {
        const token = localStorage.getItem('auth_token');

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.delete<any>(`${this.apiUrl}/clear`, { headers });
    }

    validatePanier(avecLivraison: boolean = false): Observable<any> {
        const token = localStorage.getItem('auth_token');

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.post<any>(`${this.apiUrl}/validate`, { avecLivraison }, { headers });
    }
}
