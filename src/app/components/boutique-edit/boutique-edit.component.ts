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
        // legal: {
        //     nif: '',
        //     stat: '',
        //     rent: ''
        // }
    };

    categories: any[] = [];
    users: any[] = [];
    boutiqueId!: string;
    selectedFiles: File[] = [];
    previews: string[] = [];

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
            next: (data) => {
                this.categories = data;
                console.log(this.categories);
            },
            error: (err) => console.error('Erreur catégories', err)
        });
    }

    loadBoutique(): void {
        this.boutiqueService.getBoutiqueById(this.boutiqueId).subscribe({
            next: (data) => {
                this.boutique = data;
                console.log("boutique: ", this.boutique);

                if (data.owner && data.owner._id) {
                    this.boutique.ownerId = data.owner._id;
                }
                // // Map legal nested fields if they exist as a string from backend
                // if (typeof data.legal === 'string') {
                //     try {
                //         this.boutique.legal = JSON.parse(data.legal);
                //     } catch (e) {
                //         this.boutique.legal = { nif: '', stat: '', rent: '' };
                //     }
                // } else if (data.legal) {
                //     this.boutique.legal = { ...data.legal };
                // }
            },
            error: (err) => console.error('Erreur chargement boutique', err)
        });
    }

    updateBoutique(): void {
        const formData = new FormData();

        // Appender les champs simples
        formData.append('name', this.boutique.name);
        formData.append('description', this.boutique.description);
        formData.append('categoryId', this.boutique.categoryId);
        formData.append('ownerId', this.boutique.ownerId);
        if (this.boutique.isValidated !== undefined) {
            formData.append('isValidated', String(this.boutique.isValidated));
        }

        // Appender les objets
        // formData.append('legal', JSON.stringify(this.boutique.legal));

        // Appender les nouvelles images
        if (this.selectedFiles && this.selectedFiles.length > 0) {
            for (let i = 0; i < this.selectedFiles.length; i++) {
                formData.append('images', this.selectedFiles[i]);
            }
        }

        this.boutiqueService.updateBoutique(this.boutiqueId, formData).subscribe({
            next: () => {
                this.router.navigate(['/boutiques']);
            },
            error: (err) => {
                console.error('Erreur modification', err);
                alert('Erreur lors de la modification : ' + (err.error?.message || err.message));
            }
        });
    }

    onImageSelected(event: any): void {
        if (event.target.files && event.target.files.length > 0) {
            const files = Array.from(event.target.files) as File[];
            this.selectedFiles.push(...files);

            files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.previews.push(e.target.result);
                };
                reader.readAsDataURL(file);
            });
        }
    }

    removeNewImage(index: number): void {
        this.selectedFiles.splice(index, 1);
        this.previews.splice(index, 1);
    }

    deleteExistingImage(imageId: string): void {
        if (confirm('Voulez-vous vraiment supprimer cette image ?')) {
            this.boutiqueService.deleteStoreImage(this.boutiqueId, imageId).subscribe({
                next: (response) => {
                    this.boutique = response.data;
                },
                error: (err) => {
                    console.error('Erreur suppression image', err);
                    alert('Erreur lors de la suppression de l\'image');
                }
            });
        }
    }

    getImageUrl(url: string): string {
        if (!url) return 'assets/img/default-store.jpg';
        if (url.startsWith('http')) return url;
        return `http://localhost:5000/${url.replace(/\\/g, '/')}`;
    }
}
