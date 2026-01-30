import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { environment } from "../../environnements/environnement";

@Injectable ({
    providedIn: 'root'
})
    export class CategorieService {
    constructor(private http: HttpClient) { }
    
    private apiUrl = `${environment.apiUrl}/categories`;//Utilisation variable d'environment

    getCategories(): Observable<any> {
        return this.http.get(this.apiUrl);
    }

    getCategorieById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`); // /categories/:id
    }


    addCategorie(article: any): Observable<any> {
        return this.http.post(this.apiUrl, article);
    }

    updateCategorie(id: string, article:any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, article);
    }

    deleteCategorie(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

     

}