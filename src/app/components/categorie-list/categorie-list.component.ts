import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CategorieService } from '../../services/categorie.service';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-categorie-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './categorie-list.component.html',
  styleUrl: './categorie-list.component.css',
})
export class CategorieListComponent implements OnInit {
  categories: any[] = [];
  isAdmin = false;

  constructor(
    private categorieService: CategorieService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.getRole() === 'Admin';
    console.log('ngOnInit appelé');
    this.loadCategories();
  }

  loadCategories(): void {
    console.log('loadCategories appelé');

    this.categorieService.getCategories().subscribe({
      next: (data) => {
        // console.log('Données reçues:', data);
        this.categories = data;
        // console.log('Categories assignées:', this.categories);
        // console.log('Longueur:', this.categories.length);
        this.cdr.markForCheck(); // Force Angular à vérifier les changements apres la requette HTTP
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories:', err);
      }
    });
  }

  deleteCategorie(id: string): void {
    this.categorieService.deleteCategorie(id).subscribe(() => this.loadCategories());
  }
}