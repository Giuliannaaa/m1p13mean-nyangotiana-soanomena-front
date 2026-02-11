import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environnements/environnement';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = environment.apiUrl;
    private tokenKey = 'auth_token';

    constructor() { }

    login(credentials: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/api/auth/login`, credentials).pipe(
            tap(response => {
                if (response.token) {
                    this.setToken(response.token);
                }
            })
        );
    }

    register(user: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/api/auth/register`, user);
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/api/auth/forgotpassword`, { email });
    }

    resetPassword(token: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/api/auth/reset-password`, { token, password });
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    setToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    getRole(): string | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.role || null;
        } catch (e) {
            return null;
        }
    }

    getUserId(): string | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id || null;
        } catch (e) {
            return null;
        }
    }

    redirectBasedOnRole(role: string): void {
        switch (role) {
            case 'Admin':
                this.router.navigate(['/admin/dashboard']); // Assuming admin route
                break;
            case 'Boutique':
                this.router.navigate(['/boutique/dashboard']); // Assuming boutique route
                break;
            case 'Acheteur':
            default:
                this.router.navigate(['/buyer/dashboard']); // Home for buyers
                break;
        }
    }

}
