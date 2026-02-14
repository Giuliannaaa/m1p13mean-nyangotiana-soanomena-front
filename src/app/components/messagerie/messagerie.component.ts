import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-messagerie',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './messagerie.component.html',
  styleUrl: './messagerie.component.css'
})
export class MessagereieComponent implements OnInit, OnDestroy {
  conversations: any[] = [];
  selectedConversation: any = null;
  messages: any[] = [];
  
  newMessage: string = '';
  subject: string = '';
  messageType: string = 'other';
  
  isLoading: boolean = false;
  isSending: boolean = false;
  unreadCount: number = 0;
  
  userRole: string = '';
  userId: string = '';

  // Modal et sélection
  showNewConversationModal: boolean = false;
  availableBoutiques: any[] = [];
  availableAdmins: any[] = [];
  selectedBoutiqueId: string = '';
  selectedAdminId: string = '';

  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private intervalId?: number;

  ngOnInit(): void {
    this.userRole = this.authService.getRole() || '';
    this.userId = this.authService.getUserId() || '';
    
    this.loadConversations();
    this.loadUnreadCount();
    
    // Actualiser les non-lus toutes les 30 secondes
    this.intervalId = window.setInterval(() => {
      this.loadUnreadCount();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // OUVRIR LE MODAL POUR NOUVELLE CONVERSATION
  openNewConversationModal(): void {
    this.showNewConversationModal = true;
    
    // Si c'est une boutique, charger les admins
    if (this.userRole === 'Boutique') {
      this.loadAvailableAdmins();
    } else {
      // Si c'est un admin, charger les boutiques
      this.loadAvailableBoutiques();
    }
  }

  // CHARGER LA LISTE DES BOUTIQUES (pour Admin)
  loadAvailableBoutiques(): void {
    this.messageService.getAllBoutiques().subscribe({
      next: (response: any) => {
        this.availableBoutiques = response.data || [];
        console.log('Boutiques disponibles:', this.availableBoutiques);
      },
      error: (err) => {
        console.error('Erreur chargement boutiques:', err);
      }
    });
  }

  // CHARGER LA LISTE DES ADMINS (pour Boutique)
  loadAvailableAdmins(): void {
    this.messageService.getAdmins().subscribe({
      next: (response: any) => {
        this.availableAdmins = response.data || [];
        console.log('Admins disponibles:', this.availableAdmins);
      },
      error: (err) => {
        console.error('Erreur chargement admins:', err);
      }
    });
  }

  // DÉMARRER UNE NOUVELLE CONVERSATION
  startNewConversation(): void {
  if (this.userRole === 'Boutique') {
    if (!this.selectedAdminId) {
      alert('Veuillez sélectionner un admin');
      return;
    }

    this.showNewConversationModal = false;
    
    const adminId = this.selectedAdminId;
    
    // Trouver l'admin sélectionné AVANT de fermer le modal
    const selectedAdmin = this.availableAdmins.find(a => a._id === this.selectedAdminId);
    
    this.loadConversation(adminId, adminId, {
      firstname: selectedAdmin?.firstname || 'Admin',
      lastname: selectedAdmin?.lastname || '',
      // Affiche le pseudo de l'admin
      boutiqueName: `${selectedAdmin?.firstname} ${selectedAdmin?.lastname}` 
    });
    
    this.selectedAdminId = '';
  } 
  else if (this.userRole === 'Admin') {
    if (!this.selectedBoutiqueId) {
      alert('Veuillez sélectionner une boutique');
      return;
    }

    this.messageService.getBoutiqueContact(this.selectedBoutiqueId).subscribe({
      next: (response: any) => {
        const { owner, boutique_id, boutique_name } = response.data;
        
        this.showNewConversationModal = false;
        this.selectedBoutiqueId = '';
        
        // Affiche le nom de la boutique ou du propriétaire
        this.loadConversation(owner.id, boutique_id, {
          firstname: owner.firstname,
          lastname: owner.lastname,
          // Affiche le nom de la boutique + propriétaire
          boutiqueName: `${boutique_name} (${owner.firstname} ${owner.lastname})`
        });
      },
      error: (err) => {
        console.error('Erreur démarrage conversation:', err);
        alert('Impossible de démarrer la conversation');
      }
    });
  }
}

  // ANNULER LA NOUVELLE CONVERSATION
  cancelNewConversation(): void {
    this.showNewConversationModal = false;
    this.selectedBoutiqueId = '';
    this.selectedAdminId = '';
  }

  // CHARGER TOUTES LES CONVERSATIONS
  loadConversations(): void {
    this.isLoading = true;
    this.messageService.getConversations().subscribe({
      next: (response: any) => {
        console.log('Conversations reçues:', response);
        this.conversations = response.data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement conversations:', err);
        this.isLoading = false;
      }
    });
  }

  // CHARGER LES MESSAGES D'UNE CONVERSATION
  loadConversation(otherUserId: string, boutiqueId: string, userData?: any): void {
  this.messageService.getConversation(otherUserId, boutiqueId).subscribe({
    next: (response: any) => {
      console.log('Messages de la conversation:', response);
      this.messages = response.data || [];
      
      // Utiliser d'abord le nom passé en paramètre
      let boutiqueName = userData?.boutiqueName;
      
      // Si pas de nom en paramètre, essayer de récupérer depuis les messages
      if (!boutiqueName && this.messages.length > 0 && this.messages[0].boutique_id?.name) {
        boutiqueName = this.messages[0].boutique_id.name;
      }
      
      // Fallback si rien n'a marché
      if (!boutiqueName) {
        boutiqueName = boutiqueId;
      }
      
      this.selectedConversation = { 
        otherUserId, 
        boutiqueId, 
        boutiqueName, // Utilise le nom correct
        userData 
      };
      
      // Marquer tous les messages comme lus
      this.messages.forEach(msg => {
        if (!msg.is_read && msg.receiver_id._id === this.userId) {
          this.messageService.markAsRead(msg._id).subscribe();
        }
      });
      
      this.cdr.markForCheck();
    },
    error: (err) => {
      console.error('Erreur chargement conversation:', err);
    }
  });
}

  // ENVOYER UN MESSAGE
  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation) {
      alert('Veuillez écrire un message');
      return;
    }

    console.log('selectedConversation:', this.selectedConversation);
    console.log('Données envoyées:', {
      otherUserId: this.selectedConversation.otherUserId,
      boutiqueId: this.selectedConversation.boutiqueId,
      message: this.newMessage,
      subject: this.subject,
      messageType: this.messageType
    });

    this.isSending = true;
    this.messageService.sendMessage(
      this.selectedConversation.otherUserId,
      this.selectedConversation.boutiqueId,
      this.newMessage,
      this.subject,
      this.messageType
    ).subscribe({
      next: (response: any) => {
        console.log('Message envoyé:', response);
        this.messages.push(response.data);
        this.newMessage = '';
        this.subject = '';
        this.messageType = 'other';
        this.isSending = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur envoi message:', err);
        alert('Erreur lors de l\'envoi du message');
        this.isSending = false;
      }
    });
  }

  // VÉRIFIER ET ENVOYER AU CTRL+ENTRÉE
  checkSendMessage(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.ctrlKey && keyboardEvent.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // CHARGER LE NOMBRE DE NON LUS
  loadUnreadCount(): void {
    this.messageService.getUnreadCount().subscribe({
      next: (response: any) => {
        this.unreadCount = response.unreadCount || 0;
        this.cdr.markForCheck();
      }
    });
  }

  // SUPPRIMER UN MESSAGE
  deleteMessage(messageId: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }

    this.messageService.deleteMessage(messageId).subscribe({
      next: () => {
        this.messages = this.messages.filter(m => m._id !== messageId);
        alert('Message supprimé');
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        alert('Erreur lors de la suppression');
      }
    });
  }

// SUPPRIMER UNE CONVERSATION
deleteConversation(): void {
  if (!this.selectedConversation) {
    return;
  }

  if (!confirm('Êtes-vous sûr de vouloir supprimer cette conversation entière ?')) {
    return;
  }

  this.messageService.deleteConversation(
    this.selectedConversation.otherUserId,
    this.selectedConversation.boutiqueId
  ).subscribe({
    next: () => {
      console.log('Conversation supprimée');
      alert('Conversation supprimée avec succès');
      
      // Réinitialiser la sélection
      this.selectedConversation = null;
      this.messages = [];
      
      // Recharger les conversations
      this.loadConversations();
      
      this.cdr.markForCheck();
    },
    error: (err) => {
      console.error('Erreur suppression conversation:', err);
      alert('Erreur lors de la suppression de la conversation');
    }
  });
}

  // FORMATER LA DATE
  formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // OBTENIR LA COULEUR DU TYPE DE MESSAGE
  getMessageTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'validation': '#ffc107',
      'warning': '#dc3545',
      'info': '#17a2b8',
      'question': '#007bff',
      'other': '#6c757d'
    };
    return colors[type] || '#6c757d';
  }

  getMessageTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'validation': 'Validation',
      'warning': 'Attention',
      'info': 'Info',
      'question': 'Question',
      'other': 'Autre'
    };
    return labels[type] || type;
  }
}