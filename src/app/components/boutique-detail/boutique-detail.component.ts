import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { BoutiqueService } from '../../services/boutique/boutique.service';
import { ProduitService } from '../../services/produits/produits.service';
import { Boutique } from '../../models/boutique.model';
import { Produit } from '../../models/produit.model';
import { AuthService } from '../../services/auth/auth.service';
import { SuiviService } from '../../services/suivi/suivi.service';
import { PanierService } from '../../services/panier/panier.service';
import { CategorieService } from '../../services/categorie/categorie.service';
import { Categorie } from '../../models/categorie.model';
import { NoteBoutiqueComponent } from '../note-boutique/note-boutique.component';
import { SignalerProduitComponent } from '../signalement-produit/signalement-produit.component';
import { ChangeDetectorRef } from '@angular/core';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';

@Component({
    selector: 'app-boutique-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, NoteBoutiqueComponent, SignalerProduitComponent, ImageUrlPipe],
    templateUrl: './boutique-detail.component.html',
    styleUrls: ['./boutique-detail.component.css']
})
export class BoutiqueDetailComponent implements OnInit, OnDestroy {
    boutique: Boutique | null = null;
    produits: Produit[] = [];
    isLoading = true;
    isAcheteur = false;
    isSuivie = false;
    categories: Categorie[] = [];
    showReportModal = false;
    selectedProduitId: string | null = null;

    // Carousel properties
    currentImageIndex: number = 0;
    private carouselInterval?: any;

    private route = inject(ActivatedRoute);
    private boutiqueService = inject(BoutiqueService);
    private produitService = inject(ProduitService);
    private authService = inject(AuthService);
    private suiviService = inject(SuiviService);
    private panierService = inject(PanierService);
    private categorieService = inject(CategorieService);
    private cdr = inject(ChangeDetectorRef);

    // cart
    cartData: any = null;
    private cartSubscription?: Subscription;

    ngOnInit(): void {
        this.isAcheteur = this.authService.getRole() === 'Acheteur';
        this.loadCategories();
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadBoutique(id);
            this.loadProduits(id);
            if (this.isAcheteur) {
                this.checkSuivi(id);
            }
        }
        this.loadCart();

        this.cartSubscription = this.panierService.cartUpdate$.subscribe(() => {
            this.loadCart();
        });
    }

    loadCart() {
        if (!this.isAcheteur) return;
        this.panierService.getPanier().subscribe({
            next: (res) => {
                this.cartData = res.data;
            },
            error: (err) => console.error('Error loading cart', err)
        });
    }

    loadBoutique(id: string): void {
        this.boutiqueService.getBoutiqueById(id).subscribe({
            next: (data) => {
                this.boutique = data;
                this.isLoading = false;

                // Démarrer le carousel si plusieurs images
                if (this.boutique?.images && this.boutique.images.length > 1) {
                    this.startCarousel();
                }
            },
            error: (err) => {
                console.error('Erreur chargement boutique:', err);
                this.isLoading = false;
            }
        });
    }

    loadProduitsOfBoutique(boutiqueId: string): void {
        this.produitService.getProduits().subscribe({
            next: (response: any) => {
                const allProduits = response.data || response;
                // Filtrer les produits de cette boutique
                this.produits = allProduits.filter((p: any) =>
                    p.store_id?._id === boutiqueId || p.store_id === boutiqueId
                );
            },
            error: (err) => {
                console.error('Erreur chargement produits:', err);
            }
        });
    }

    loadCategories(): void {
        this.categorieService.getCategories().subscribe({
            next: (response: any) => {
                this.categories = response.data || response;
            }
        });
    }

    getCategoryName(id: string | undefined): string {
        if (!id) return 'N/A';
        const cat = this.categories.find(c => c._id === id);
        return cat ? cat.nom_cat : 'N/A';
    }

    loadProduits(id: string): void {
        this.produitService.getProduitsByBoutique(id).subscribe({
            next: (response) => {
                this.produits = response.data || response;
                // console.log("Produits de la boutique", this.produits);

            },
            error: (err) => {
                console.error('Erreur chargement produits:', err);
            }
        });
    }

    checkSuivi(id: string): void {
        this.suiviService.getBoutiquesSuivies().subscribe({
            next: (ids) => {
                this.isSuivie = ids.includes(id);
            }
        });
    }

    getRatingStar(): string {
        if (!this.boutique || !this.boutique.rating) return '☆☆☆☆☆';

        const rating = this.boutique.rating;
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? '⭐' : '☆';
        }
        return stars;
    }

    toggleSuivi(): void {
        if (!this.boutique) return;

        if (this.isSuivie) {
            this.suiviService.arreterSuivreBoutique(this.boutique._id).subscribe({
                next: () => {
                    this.isSuivie = false;
                }
            });
        } else {
            this.suiviService.suivreBoutique(this.boutique._id).subscribe({
                next: () => {
                    this.isSuivie = true;
                }
            });
        }
    }

    addToPanier(produit: Produit): void {
        if (!this.isAcheteur) {
            alert("Vous devez être connecté en tant qu'acheteur pour ajouter au panier.");
            return;
        }

        this.panierService.addToPanier(produit._id!, 1).subscribe({
            next: () => {
                alert('Produit ajouté au panier !');
                this.panierService.notifyCartUpdate();
            },
            error: (err) => {
                console.error(err);
                alert("Erreur lors de l'ajout au panier");
            }
        });
    }

    getOriginalPrice(produit: Produit): number {
        if (produit.prix_unitaire?.$numberDecimal) {
            return parseFloat(produit.prix_unitaire.$numberDecimal);
        }
        return typeof produit.prix_unitaire === 'number' ? produit.prix_unitaire : 0;
    }

    getProductPrice(produit: Produit): number {
        if (produit.isPromoted && produit.prix_promo) {
            return produit.prix_promo;
        }
        return this.getOriginalPrice(produit);
    }

    toggleReportModal(produitId: string | null = null): void {
        this.selectedProduitId = produitId;
        this.showReportModal = !!produitId;
        this.cdr.markForCheck();
    }

    // ============================================
    // MÉTHODES CAROUSEL
    // ============================================

    /**
     * Démarrer le carousel automatique
     * Change d'image toutes les 5 secondes
     */
    private startCarousel(): void {
        this.carouselInterval = setInterval(() => {
            this.nextImage();
        }, 5000); // 5000ms = 5 secondes
    }

    /**
     * Passer à l'image suivante
     */
    private nextImage(): void {
        if (this.boutique?.images) {
            this.currentImageIndex = (this.currentImageIndex + 1) % this.boutique.images.length;
        }
    }

    /**
     * Définir une image spécifique (appelé par les indicateurs)
     * @param index Index de l'image à afficher
     */
    setImage(index: number): void {
        this.currentImageIndex = index;

        // Redémarrer le timer après un clic manuel
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
            this.startCarousel();
        }
    }

    /**
     * Nettoyer l'interval quand le component est détruit
     */
    ngOnDestroy(): void {
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
        }
        this.cartSubscription?.unsubscribe();
    }
}