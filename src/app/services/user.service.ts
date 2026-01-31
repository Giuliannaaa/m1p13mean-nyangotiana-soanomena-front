import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/users`;

    getUserShop(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/getUserShop`);
    }

    getBuyer(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/getBuyerUsers`);
    }

    getAdmin(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/getAdminUsers`);
    }

    // router.patch('/:id/toggle-validation', toggleUserValidation);
    updateUserValidation(id: string): Observable<User> {
        return this.http.patch<User>(`${this.apiUrl}/${id}/toggle-validation`, {});
    }
}
