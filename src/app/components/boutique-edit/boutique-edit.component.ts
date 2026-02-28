import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BoutiqueService } from '../../services/boutique/boutique.service';
import { CategorieService } from '../../services/categorie/categorie.service';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { environment } from '../../../environments/environment';
import imageCompression from 'browser-image-compression';
import { uploadToCloudinary } from '../../services/cloudinary/uploadToCloudinary';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';

@Component({
    selector: 'app-boutique-edit',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ImageUrlPipe],
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

    isCompressing = false;
    isUploading = false;

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
            },
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
            },
            error: (err) => console.error('Erreur chargement boutique', err)
        });
    }

    // Compression d'une image
    private async compressImage(file: File): Promise<File> {
        const options = {
            maxSizeMB: 300,           // max 1MB par image
            maxWidthOrHeight: 1024, // redimensionner si trop grand
            useWebWorker: true,
        };
        return await imageCompression(file, options);
    }

    async updateBoutique(): Promise<void> {
        this.isUploading = true;
        try {
            if (environment.production) {
                // ── PROD : uploader les images sur Cloudinary puis updateBoutique ──
                const imageUrls: string[] = [];

                if (this.selectedFiles.length > 0) {
                    for (const file of this.selectedFiles) {
                        const compressed = await this.compressImage(file);
                        const url = await uploadToCloudinary(compressed, `stores/${this.boutiqueId}`);
                        imageUrls.push(url);
                    }
                }

                const payload: any = {
                    name: this.boutique.name,
                    description: this.boutique.description,
                    categoryId: this.boutique.categoryId,
                    ownerId: this.boutique.ownerId,
                    isValidated: this.boutique.isValidated,
                };

                if (imageUrls.length > 0) {
                    payload.imageUrls = imageUrls;
                }

                this.boutiqueService.updateBoutique(this.boutiqueId, payload).subscribe({
                    next: () => this.router.navigate(['/boutiques']),
                    error: (err) => {
                        console.error('Erreur modification', err);
                        alert('Erreur : ' + (err.error?.message || err.message));
                    }
                });

            } else {
                // ── DEV : envoi multipart ──
                const formData = new FormData();
                formData.append('name', this.boutique.name);
                formData.append('description', this.boutique.description);
                formData.append('categoryId', this.boutique.categoryId);
                formData.append('ownerId', this.boutique.ownerId);
                if (this.boutique.isValidated !== undefined) {
                    formData.append('isValidated', String(this.boutique.isValidated));
                }

                if (this.selectedFiles.length > 0) {
                    this.isCompressing = true;
                    for (const file of this.selectedFiles) {
                        const compressed = await this.compressImage(file);
                        formData.append('images', compressed, file.name);
                    }
                    this.isCompressing = false;
                }

                this.boutiqueService.updateBoutique(this.boutiqueId, formData).subscribe({
                    next: () => this.router.navigate(['/boutiques']),
                    error: (err) => {
                        console.error('Erreur modification', err);
                        alert('Erreur : ' + (err.error?.message || err.message));
                    }
                });
            }
        } catch (error) {
            console.error('Erreur modification', error);
            alert('Erreur : ' + (error));
        }
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

}
