import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
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

@Component({
    selector: 'app-boutique-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, NoteBoutiqueComponent, SignalerProduitComponent],
    templateUrl: './boutique-detail.component.html',
    styleUrls: ['./boutique-detail.component.css']
})
export class BoutiqueDetailComponent implements OnInit {
    boutique: Boutique | null = null;
    produits: Produit[] = [];
    isLoading = true;
    isAcheteur = false;
    isSuivie = false;
    categories: Categorie[] = [];
    showReportModal = false;
    selectedProduitId: string | null = null;

    private route = inject(ActivatedRoute);
    private boutiqueService = inject(BoutiqueService);
    private produitService = inject(ProduitService);
    private authService = inject(AuthService);
    private suiviService = inject(SuiviService);
    private panierService = inject(PanierService);
    private categorieService = inject(CategorieService);
    private cdr = inject(ChangeDetectorRef);

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
    }

    loadBoutique(id: string): void {
        this.boutiqueService.getBoutiqueById(id).subscribe({
            next: (data) => {
                this.boutique = data;
                this.isLoading = false;
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
                console.log("Produits de la boutique", this.produits);

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
            },
            error: (err) => {
                console.error(err);
                alert("Erreur lors de l'ajout au panier");
            }
        });
    }

    getProductPrice(produit: Produit): number {
        if (produit.prix_unitaire?.$numberDecimal) {
            return parseFloat(produit.prix_unitaire.$numberDecimal);
        }
        return typeof produit.prix_unitaire === 'number' ? produit.prix_unitaire : 0;
    }

    toggleReportModal(produitId: string | null = null): void {
        this.selectedProduitId = produitId;
        this.showReportModal = !!produitId;
        this.cdr.markForCheck();
    }
}
