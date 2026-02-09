import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BoutiqueService } from '../../services/boutique/boutique.service';
import { CategorieService } from '../../services/categorie/categorie.service';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';

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

  addBoutique(): void {
    const formData = new FormData();

    // Appender les champs simples
    formData.append('name', this.boutique.name);
    formData.append('description', this.boutique.description);
    formData.append('categoryId', this.boutique.categoryId);
    formData.append('ownerId', this.boutique.ownerId);
    formData.append('isValidated', String(this.boutique.isValidated));

    // Appender les objets (JSON stringify nécessaire pour express-fileupload avec parseNested: true)
    formData.append('legal', JSON.stringify(this.boutique.legal));

    // Appender les images
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        formData.append('images', this.selectedFiles[i]);
      }
    }

    this.boutiqueService.createBoutique(formData).subscribe({
      next: () => {
        this.router.navigate(['/boutiques']);
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout', err);
        alert('Une erreur est survenue lors de l\'ajout de la boutique : ' + (err.error?.message || err.message));
      }
    });
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
