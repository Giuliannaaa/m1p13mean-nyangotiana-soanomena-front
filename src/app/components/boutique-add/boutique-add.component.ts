import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BoutiqueService } from '../../services/boutique/boutique.service';
import { CategorieService } from '../../services/categorie/categorie.service';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import imageCompression from 'browser-image-compression';
import { environment } from '../../../environments/environment.prod';
import { uploadToCloudinary } from '../../services/cloudinary/uploadToCloudinary';

@Component({
  selector: 'app-boutique-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './boutique-add.component.html',
  styleUrl: './boutique-add.component.css',
})
export class BoutiqueAddComponent implements OnInit {
  boutique = {
    name: '',
    description: '',
    categoryId: '',
    ownerId: '',
    isValidated: true,
    legal: {
      nif: '',
      stat: '',
      rent: ''
    },
    images: []
  };

  categories: any[] = [];
  users: any[] = [];
  selectedFiles: File[] = [];
  previews: string[] = [];
  isCompressing = false;
  isUploading = false;

  private boutiqueService = inject(BoutiqueService);
  private categorieService = inject(CategorieService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    // Security check: only Admin can add boutique
    if (this.authService.getRole() !== 'Admin') {
      this.router.navigate(['/boutiques']);
      return;
    }
    this.loadCategories();
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUserShop().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs', err);
      }
    });
  }

  loadCategories(): void {
    this.categorieService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Erreur chargement catégories', err);
      }
    });
  }

  // Compression d'une image
  private async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 300,           // max 500MB par image
      maxWidthOrHeight: 1024, // redimensionner si trop grand
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  }

  async addBoutique(): Promise<void> {
    this.isUploading = true;

    try {
      if (environment.production) {
        // PROD : upload vers Cloudinary, envoyer les URLs au backend ──
        const payload = {
          name: this.boutique.name,
          description: this.boutique.description,
          categoryId: this.boutique.categoryId,
          ownerId: this.boutique.ownerId,
          isValidated: this.boutique.isValidated,
          legal: this.boutique.legal
        };

        this.boutiqueService.createBoutique(payload).subscribe({
          next: async (res: any) => {
            const boutiqueId = res.data._id;
            if (this.selectedFiles && this.selectedFiles.length > 0) {
              const imageUrls: string[] = [];
              for (const file of this.selectedFiles) {
                const compressed = await this.compressImage(file);
                const url = await uploadToCloudinary(compressed, `stores/${boutiqueId}`);
                imageUrls.push(url);
              }
              // Mettre à jour la boutique avec les URLs
              await this.boutiqueService.updateBoutique(boutiqueId, { imageUrls }).toPromise();
            }
            this.router.navigate(['/boutiques']);
          },
          error: (err) => {
            console.error('Erreur création boutique:', err);
            alert('Erreur : ' + (err.error?.message || err.message));
          }
        });

      } else {
        // DEV : comportement actuel, envoi multipart au backend ──
        const formData = new FormData();
        formData.append('name', this.boutique.name);
        formData.append('description', this.boutique.description);
        formData.append('categoryId', this.boutique.categoryId);
        formData.append('ownerId', this.boutique.ownerId);
        formData.append('isValidated', String(this.boutique.isValidated));
        formData.append('legal', JSON.stringify(this.boutique.legal));

        // Compresser les images avant envoi
        if (this.selectedFiles && this.selectedFiles.length > 0) {
          this.isCompressing = true;
          try {
            for (const file of this.selectedFiles) {
              const compressed = await this.compressImage(file);
              formData.append('images', compressed, file.name);
            }
          } catch (err) {
            console.error('Erreur compression image:', err);
            alert('Erreur lors de la compression des images');
            this.isCompressing = false;
            return;
          }
          this.isCompressing = false;
        }

        this.boutiqueService.createBoutique(formData).subscribe({
          next: () => this.router.navigate(['/boutiques']),
          error: (err) => {
            console.error('Erreur création boutique:', err);
            alert('Erreur : ' + (err.error?.message || err.message));
          }
        });
      }

    } catch (err) {
      console.error('Erreur upload:', err);
      alert('Erreur lors de l\'upload des images');
    } finally {
      this.isUploading = false;
    }
  }

  onImageSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
      this.previews = [];

      this.selectedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }
}
