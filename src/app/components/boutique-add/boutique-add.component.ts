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
    }
  };

  categories: any[] = [];
  users: any[] = [];

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
    const newBoutique: any = { ...this.boutique };

    this.boutiqueService.createBoutique(newBoutique).subscribe({
      next: () => {
        this.router.navigate(['/boutiques']);
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout', err);
        alert('Une erreur est survenue lors de l\'ajout de la boutique');
      }
    });
  }
}
