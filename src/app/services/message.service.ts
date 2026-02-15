import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environnements/environnement';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/api/messages`;
  
  private unreadCount$ = new BehaviorSubject<number>(0);


  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

   private boutiqueApiUrl = 'http://localhost:5000/boutiques'; 

  // ENVOYER UN MESSAGE
  sendMessage(receiverId: string, boutiqueId: string, message: string, subject?: string, messageType?: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/envoyer`,
      {
        receiver_id: receiverId,
        boutique_id: boutiqueId,
        message,
        subject,
        message_type: messageType || 'other'
      },
      { headers: this.getHeaders() }
    );
  }

getBoutiqueContact(boutiqueId: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/boutique/${boutiqueId}/contact`, { headers: this.getHeaders() });
}

  // OBTENIR LES MESSAGES REÇUS
  getReceivedMessages(boutiqueId?: string): Observable<any> {
    let url = `${this.apiUrl}/recus`;
    if (boutiqueId) {
      url += `?boutique_id=${boutiqueId}`;
    }
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // OBTENIR LES MESSAGES ENVOYÉS
  getSentMessages(boutiqueId?: string): Observable<any> {
    let url = `${this.apiUrl}/envoyes`;
    if (boutiqueId) {
      url += `?boutique_id=${boutiqueId}`;
    }
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // Obtenir le nom de la boutique
  getBoutiqueName(boutiqueId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/boutique/${boutiqueId}/name`,
      { headers: this.getHeaders() }
    );
  }

  // OBTENIR LA LISTE DES ADMINS
  getAdmins(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/admins`,
      { headers: this.getHeaders() }
    );
  }

  // OBTENIR UNE CONVERSATION
  getConversation(otherUserId: string, boutiqueId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/conversation/${otherUserId}/${boutiqueId}`,
      { headers: this.getHeaders() }
    );
  }

  // OBTENIR TOUTES LES CONVERSATIONS
  getConversations(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/conversations`,
      { headers: this.getHeaders() }
    );
  }

  // MARQUER COMME LU
  markAsRead(messageId: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${messageId}/lire`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // OBTENIR LE NOMBRE DE NON LUS
  getUnreadCount(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/non-lus/count`,
      { headers: this.getHeaders() }
    );
  }

  // OBSERVABLE DU NOMBRE DE NON LUS
  getUnreadCount$(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  // METTRE À JOUR LE NOMBRE DE NON LUS
  updateUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (response: any) => {
        this.unreadCount$.next(response.unreadCount);
      }
    });
  }

getAllBoutiques(): Observable<any> {
  return this.http.get(this.boutiqueApiUrl, { headers: this.getHeaders() });
}

  // SUPPRIMER UN MESSAGE
  deleteMessage(messageId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${messageId}`,
      { headers: this.getHeaders() }
    );
  }

  // Supprimer une conversation
deleteConversation(otherUserId: string, boutiqueId: string): Observable<any> {
  return this.http.delete(
    `${this.apiUrl}/conversation/${otherUserId}/${boutiqueId}`,
    { headers: this.getHeaders() }
  );
}
}