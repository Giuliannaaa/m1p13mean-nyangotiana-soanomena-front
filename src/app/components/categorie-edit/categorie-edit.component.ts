import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategorieService } from '../../services/categorie/categorie.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-categorie-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './categorie-edit.component.html',
  styleUrl: './categorie-edit.component.css'
})
export class CategorieEditComponent implements OnInit {

  categorieId!: string;
  categorie = { nom_cat: '', descriptions: '' };

  constructor(
    private route: ActivatedRoute,
    private categorieService: CategorieService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    if (this.authService.getRole() !== 'Admin') {
      this.router.navigate(['/categories']);
      return;
    }
    this.categorieId = this.route.snapshot.paramMap.get('id')!;
    this.loadCategorie();
  }

  loadCategorie(): void {
    this.categorieService.getCategorieById(this.categorieId).subscribe(data => {
      this.categorie = data;
    });
  }

  updateCategorie(): void {
    this.categorieService.updateCategorie(this.categorieId, this.categorie).subscribe(() => {
      this.router.navigate(['/categories']);
    });
  }
}
