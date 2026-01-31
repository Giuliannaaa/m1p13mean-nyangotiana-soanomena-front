import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {

  private apiUrl = `${environment.apiUrl}/promotions`;//Utilisation variable d'environment

  constructor(private http: HttpClient) {}

  /** Ajouter une promotion */
  addPromotion(promotion: any): Observable<any> {
    return this.http.post(this.apiUrl, promotion);
  }

  /** Récupérer toutes les promotions */
  getPromotions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /** Récupérer une promotion par ID */
  getPromotionById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /** Modifier une promotion */
  updatePromotion(id: string, promotion: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, promotion);
  }

  /** Supprimer une promotion */
  deletePromotion(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

   /** Récupérer la promotion active pour un produit */
  getPromotionActiveByProduit(prod_id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/active/${prod_id}`);
  }
}
