import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { MessageService } from './message.service';
import { SignalementService } from './signalement.service';
import { AchatService } from './achat/achat.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl;

  // BehaviorSubjects pour les notifications en temps réel
  private unreadMessagesSubject = new BehaviorSubject<number>(0);
  private unreadAchatsSubject = new BehaviorSubject<number>(0);
  private unreadSignalementsSubject = new BehaviorSubject<number>(0);
  private totalNotificationsSubject = new BehaviorSubject<number>(0);

  // Observables publics
  unreadMessages$ = this.unreadMessagesSubject.asObservable();
  unreadAchats$ = this.unreadAchatsSubject.asObservable();
  unreadSignalements$ = this.unreadSignalementsSubject.asObservable();
  totalNotifications$ = this.totalNotificationsSubject.asObservable();

  constructor(private http: HttpClient,
    private messageService: MessageService,
    private signalementService: SignalementService,
    private achatService: AchatService) { }

  /**
   * Charger TOUTES les notifications
   */
  loadAllNotifications(): void {
    this.loadUnreadMessages();
    this.loadUnreadAchats();
    this.loadUnreadSignalements();
  }

  /**
   * MESSAGES : Obtenir le nombre de messages non lus
   */

  loadUnreadMessages(): void {
    this.messageService.getUnreadCount().subscribe({
      next: (response) => {
        const count = response.unreadCount || response.count || 0;
        this.unreadMessagesSubject.next(count);
        this.updateTotalNotifications();
      },
      error: () => this.unreadMessagesSubject.next(0)
    });
  }

  /**
   * ACHATS : Obtenir le nombre d'achats non traités
   * Pour BOUTIQUE : achats en attente de confirmation
   * Pour ACHETEUR : achats en attente de réponse
   */
  loadUnreadAchats(): void {
    this.achatService.getUnreadCount().subscribe({
      next: (response) => {
        const count = response.unreadCount || response.count || 0;
        this.unreadAchatsSubject.next(count);
        this.updateTotalNotifications();
      },
      error: () => this.unreadAchatsSubject.next(0)
    });
  }

  /**
   * SIGNALEMENTS : Obtenir le nombre de signalements non traités
   * Pour BOUTIQUE : signalements reçus non traités
   * Pour ACHETEUR : signalements en attente de réponse
   */
  loadUnreadSignalements(): void {
    this.signalementService.getUnreadCount().subscribe({
      next: (response) => {
        const count = response.unreadCount || response.count || 0;
        this.unreadSignalementsSubject.next(count);
        this.updateTotalNotifications();
      },
      error: () => this.unreadSignalementsSubject.next(0)
    });
  }

  /**
   * Mettre à jour le total des notifications
   */
  private updateTotalNotifications(): void {
    const total =
      this.unreadMessagesSubject.value +
      this.unreadAchatsSubject.value +
      this.unreadSignalementsSubject.value;
    this.totalNotificationsSubject.next(total);
  }

  /**
   * Obtenir les valeurs actuelles
   */
  getUnreadMessages(): number {
    return this.unreadMessagesSubject.value;
  }

  getUnreadAchats(): number {
    return this.unreadAchatsSubject.value;
  }

  getUnreadSignalements(): number {
    return this.unreadSignalementsSubject.value;
  }

  getTotalNotifications(): number {
    return this.totalNotificationsSubject.value;
  }

  /**
   * Réinitialiser les notifications
   */
  resetNotifications(): void {
    this.unreadMessagesSubject.next(0);
    this.unreadAchatsSubject.next(0);
    this.unreadSignalementsSubject.next(0);
    this.totalNotificationsSubject.next(0);
  }
}