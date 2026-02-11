import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class PanierService {
    // Use environment variable if available, otherwise fallback (or hardcode for now as per other services)
    private apiUrl = 'http://localhost:5000/api/panier';

    constructor(private http: HttpClient) { }

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
