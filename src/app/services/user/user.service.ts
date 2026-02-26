import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private apiUrl = `${environment.apiUrl}/users`;

    /**
     * Créer les headers avec le token
     */
    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }

    updateUserProfile(id: string, data: FormData): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, data);
    }

    getUserShop(): Observable<User[]> {
        return this.http.get<User[]>(
            `${this.apiUrl}/getUserShop`,
            { headers: this.getHeaders() }
        );
    }

    getBuyer(): Observable<User[]> {
        return this.http.get<User[]>(
            `${this.apiUrl}/getBuyerUsers`,
            { headers: this.getHeaders() }
        );
    }

    getAdmin(): Observable<User[]> {
        return this.http.get<User[]>(
            `${this.apiUrl}/getAdminUsers`,
            { headers: this.getHeaders() }
        );
    }

    getUserDocuments(): Observable<any> {
        return this.http.get(`${this.apiUrl}/boutique-documents`);
    }

    /**
     * NOUVELLE MÉTHODE : Récupérer l'utilisateur par ID
     */
    getUserById(id: string): Observable<any> {
        return this.http.get<any>(
            `${this.apiUrl}/${id}`,
            { headers: this.getHeaders() }
        );
    }

    /**
     * NOUVELLE MÉTHODE : Mettre à jour le profil
     */
    /*updateUserProfile(id: string, data: any): Observable<any> {
        return this.http.put<any>(
            `${this.apiUrl}/${id}`,
            data,
            { headers: this.getHeaders() }
        );
    }*/

    updateUserValidation(id: string): Observable<User> {
        return this.http.patch<User>(
            `${this.apiUrl}/${id}/toggle-validation`,
            {},
            { headers: this.getHeaders() }
        );
    }

    requestDeleteAccount(id: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/request-delete`, {});
    }

    cancelDeleteAccount(id: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/cancel-delete`, {});
    }

    changePassword(id: string, data: { currentPassword: string, newPassword: string }): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/change-password`, data);
    }
}