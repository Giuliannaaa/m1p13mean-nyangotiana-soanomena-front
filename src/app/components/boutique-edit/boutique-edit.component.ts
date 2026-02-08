import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BoutiqueService } from '../../services/boutique/boutique.service';
import { CategorieService } from '../../services/categorie/categorie.service';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';

@Component({
    selector: 'app-boutique-edit',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './boutique-edit.component.html',
    styleUrl: './boutique-edit.component.css'
})
export class BoutiqueEditComponent implements OnInit {
    boutique: any = {
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
    boutiqueId!: string;

    private boutiqueService = inject(BoutiqueService);
    private categorieService = inject(CategorieService);
    private userService = inject(UserService);
    private authService = inject(AuthService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    ngOnInit(): void {
        if (this.authService.getRole() !== 'Admin') {
            this.router.navigate(['/boutiques']);
            return;
        }

        this.boutiqueId = this.route.snapshot.params['id'];
        this.loadCategories();
        this.loadUsers();
        this.loadBoutique();
    }

    loadUsers(): void {
        this.userService.getUserShop().subscribe({
            next: (data) => this.users = data,
            error: (err) => console.error('Erreur utilisateurs', err)
        });
    }

    loadCategories(): void {
        this.categorieService.getCategories().subscribe({
            next: (data) => this.categories = data,
            error: (err) => console.error('Erreur catégories', err)
        });
    }

    loadBoutique(): void {
        this.boutiqueService.getBoutiqueById(this.boutiqueId).subscribe({
            next: (data) => {
                this.boutique = data;
                if (data.owner && data.owner._id) {
                    this.boutique.ownerId = data.owner._id;
                }
                // Map legal nested fields if they exist as a string from backend
                if (typeof data.legal === 'string') {
                    try {
                        this.boutique.legal = JSON.parse(data.legal);
                    } catch (e) {
                        this.boutique.legal = { nif: '', stat: '', rent: '' };
                    }
                } else if (data.legal) {
                    this.boutique.legal = { ...data.legal };
                }
            },
            error: (err) => console.error('Erreur chargement boutique', err)
        });
    }

    updateBoutique(): void {
        this.boutiqueService.updateBoutique(this.boutiqueId, this.boutique).subscribe({
            next: () => {
                this.router.navigate(['/boutiques']);
            },
            error: (err) => {
                console.error('Erreur modification', err);
                alert('Erreur lors de la modification');
            }
        });
    }
}
