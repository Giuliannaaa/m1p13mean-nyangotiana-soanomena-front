import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { BoutiqueService } from '../../services/boutique/boutique.service';
import { Boutique } from '../../models/boutique.model';
import { uploadToCloudinary } from '../../services/cloudinary/uploadToCloudinary';
import imageCompression from 'browser-image-compression';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private boutiqueService = inject(BoutiqueService);
  private route = inject(ActivatedRoute);

  boutique: Boutique | null = null;
  // User data
  user: any = {
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    role: '',
  };

  // Edit mode
  isEditMode: boolean = false;
  editData: any = {};

  // Loading & Messages
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  // File upload
  documentFile: File | null = null;
  documentPreview: string = '';

  ngOnInit(): void {
    this.loadUserProfile();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBoutique(id);


    }
  }

  private async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 300,           // max 500MB par image
      maxWidthOrHeight: 1024, // redimensionner si trop grand
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  }

  loadBoutique(id: string): void {
    this.boutiqueService.getBoutiqueById(id).subscribe({
      next: (data) => {
        this.boutique = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement boutique:', err);
        this.isLoading = false;
      }
    });
  }

  loadUserProfile(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.id) {
      this.errorMessage = 'Vous devez être connecté';
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getUserById(currentUser.id).subscribe({
      next: (response: any) => {
        const userData = response.data || response;
        this.user = {
          _id: userData._id,
          firstname: userData.firstname || '',
          lastname: userData.lastname || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || 'Acheteur',
          createdAt: userData.createdAt,
          document: {
            type: userData.document?.type || '',
            number: userData.document?.number || '',
            file: userData.document?.file || ''
          },
          deleteRequestedAt: userData.deleteRequestedAt || null
        };
        this.isLoading = false;
        this.cdr.markForCheck();

        // Charger la boutique si l'utilisateur est de rôle Boutique
        if (this.user.role === 'Boutique') {
          this.loadBoutiqueByOwner(this.user._id);
        }
      },
      error: (err) => {
        console.error('Erreur chargement profil:', err);
        this.errorMessage = 'Erreur lors du chargement du profil';
        this.isLoading = false;
      }
    });
  }

  loadBoutiqueByOwner(ownerId: string): void {
    console.log('ownerId envoyé:', ownerId);
    this.boutiqueService.getBoutiqueByOwner(ownerId).subscribe({
      next: (data) => {
        console.log('Boutique trouvée:', data);
        this.boutique = data.data || data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Status:', err.status);
        console.error('Message:', err.error);
        if (err.status === 404) {
          this.boutique = null; // pas de boutique pour cet utilisateur
        }
      }
    });
  }



  /**
   * Activer le mode édition
   */
  enableEditMode(): void {
    this.isEditMode = true;
    this.editData = {
      ...this.user,
      document: {
        type: this.user.document?.type || '',
        number: this.user.document?.number || '',
        file: this.user.document?.file || ''
      }
    };
    this.successMessage = '';
    this.errorMessage = '';
  }

  /**
   * Annuler l'édition
   */
  cancelEdit(): void {
    this.isEditMode = false;
    this.editData = {};
    this.documentFile = null;
    this.documentPreview = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  /**
   * Gérer l'upload de document
   */
  onDocumentSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.documentFile = file;

      // Aperçu
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.documentPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Sauvegarder les modifications
   */

  async saveProfile(): Promise<void> {
    if (!this.editData.firstname || !this.editData.lastname) {
      this.errorMessage = 'Le prénom et nom sont obligatoires';
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      if (environment.production) {
        // ── PROD : upload Cloudinary si fichier, puis envoyer l'URL ──
        const payload: any = {
          firstname: this.editData.firstname,
          lastname: this.editData.lastname,
          phone: this.editData.phone || '',
        };

        if (this.editData.document?.type) {
          payload.document = {
            type: this.editData.document.type,
            number: this.editData.document.number || ''
          };
        }

        if (this.documentFile) {
          const isImage = this.documentFile.type.startsWith('image/');
          const fileToUpload = isImage
            ? await this.compressImage(this.documentFile)
            : this.documentFile;
          const url = await uploadToCloudinary(fileToUpload, `documents/${this.editData.firstname}`);
          payload.documentFileUrl = url;
        }

        this.userService.updateUserProfile(this.user._id, payload).subscribe({
          next: () => {
            this.successMessage = 'Profil mis à jour avec succès !';
            this.isEditMode = false;
            this.documentFile = null;
            this.documentPreview = '';
            this.isLoading = false;
            this.cdr.markForCheck();
            setTimeout(() => { this.successMessage = ''; }, 3000);
          },
          error: (err) => {
            console.error('Erreur complète:', err);
            console.error('Status:', err.status);
            console.error('Message backend:', err.error);
            this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour';
            this.isLoading = false;
          }
        });

      } else {
        // ── DEV : envoi multipart ──
        const formData = new FormData();
        formData.append('firstname', this.editData.firstname);
        formData.append('lastname', this.editData.lastname);
        formData.append('phone', this.editData.phone || '');

        if (this.editData.document?.type) {
          formData.append('document', JSON.stringify({
            type: this.editData.document.type,
            number: this.editData.document.number || ''
          }));
        }

        if (this.documentFile) {
          formData.append('documentFile', this.documentFile);
        }

        this.userService.updateUserProfile(this.user._id, formData).subscribe({
          next: () => {
            this.successMessage = 'Profil mis à jour avec succès !';
            this.isEditMode = false;
            this.documentFile = null;
            this.documentPreview = '';
            this.isLoading = false;
            this.cdr.markForCheck();
            setTimeout(() => { this.successMessage = ''; }, 3000);
          },
          error: (err) => {
            console.error('Erreur complète:', err);
            console.error('Status:', err.status);
            console.error('Message backend:', err.error);
            this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour';
            this.isLoading = false;
          }
        });
      }

    } catch (err) {
      console.error('Erreur upload:', err);
      this.errorMessage = 'Erreur lors de l\'upload du fichier';
      this.isLoading = false;
    }
  }

  /**
   * Formater la date
   */
  formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Obtenir la couleur du badge rôle
   */
  getRoleBadgeClass(role: string): string {
    const roleMap: any = {
      'Admin': 'badge-admin',
      'Boutique': 'badge-boutique',
      'Acheteur': 'badge-acheteur'
    };
    return roleMap[role] || 'badge-default';
  }

  /**
   * Obtenir l'icône du rôle
   */
  getRoleIcon(role: string): string {
    const icons: any = {
      'Admin': '',
      'Boutique': '',
      'Acheteur': ''
    };
    return icons[role] || '';
  }

  showDeleteModal: boolean = false;

  requestDelete(): void {
    this.userService.requestDeleteAccount(this.user._id).subscribe({
      next: (response) => {
        this.user.deleteRequestedAt = response.deleteRequestedAt;
        this.showDeleteModal = false;
        this.successMessage = 'Demande de suppression enregistrée. Votre compte sera supprimé dans 30 jours.';
        this.cdr.markForCheck();
        setTimeout(() => { this.successMessage = ''; }, 5000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la demande de suppression';
      }
    });
  }

  cancelDelete(): void {
    this.userService.cancelDeleteAccount(this.user._id).subscribe({
      next: () => {
        this.user.deleteRequestedAt = null;
        this.successMessage = 'Demande de suppression annulée.';
        this.cdr.markForCheck();
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'annulation';
      }
    });
  }

  getDaysRemaining(): number {
    if (!this.user.deleteRequestedAt) return 30;
    const deleteDate = new Date(this.user.deleteRequestedAt).getTime() + 30 * 24 * 60 * 60 * 1000;
    return Math.ceil((deleteDate - Date.now()) / (1000 * 60 * 60 * 24));
  }

  // Password change
  showPasswordModal: boolean = false;
  passwordData: any = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  passwordError: string = '';
  passwordSuccess: string = '';
  isChangingPassword: boolean = false;

  openPasswordModal(): void {
    this.showPasswordModal = true;
    this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.passwordError = '';
  }

  changePassword(): void {
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword || !this.passwordData.confirmPassword) {
      this.passwordError = 'Tous les champs sont obligatoires';
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.passwordError = 'Le nouveau mot de passe doit contenir au moins 6 caractères';
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordError = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.isChangingPassword = true;
    this.passwordError = '';

    this.userService.changePassword(this.user._id, {
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    }).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.showPasswordModal = false;
        this.successMessage = 'Mot de passe modifié avec succès !';
        this.cdr.markForCheck();
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (err) => {
        this.isChangingPassword = false;
        this.passwordError = err.error?.message || 'Mot de passe actuel incorrect';
      }
    });
  }
}

