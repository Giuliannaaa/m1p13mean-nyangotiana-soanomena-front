import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CategorieService } from '../../services/categorie.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-categorie-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './categorie-add.component.html',
  styleUrl: './categorie-add.component.css',
})
export class CategorieAddComponent implements OnInit {
  categories: any[] = [];
  newCategorie = { nom_cat: '', descriptions: '' }; //Nouveau modèle pour le formulaire

  constructor(
    private categorieService: CategorieService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    if (this.authService.getRole() !== 'Admin') {
      this.router.navigate(['/categories']);
      return;
    }
  }

  addCategorie(): void {
    console.log(this.newCategorie);

    if (!this.newCategorie.nom_cat) {
      alert('Le nom de la catégorie est obligatoire');
      return;
    }

    this.categorieService.addCategorie(this.newCategorie).subscribe({
      next: () => {
        this.newCategorie = { nom_cat: '', descriptions: '' };
        this.router.navigate(['/categories']); // redirection
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors de l'ajout de la catégorie");
      }
    });
  }
}
