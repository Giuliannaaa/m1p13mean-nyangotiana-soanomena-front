import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanierService } from '../../services/panier.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-panier',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './panier.component.html',
    styleUrl: './panier.component.css'
})
export class PanierComponent implements OnInit {
    panierService = inject(PanierService);
    router = inject(Router);

    panier: any = null;
    isLoading = true;
    errorMessage = '';

    ngOnInit(): void {
        this.loadPanier();
    }

    loadPanier() {
        this.isLoading = true;
        this.panierService.getPanier().subscribe({
            next: (res) => {
                this.panier = res.data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading cart', err);
                this.errorMessage = 'Impossible de charger le panier.';
                this.isLoading = false;
            }
        });
    }

    updateQuantity(productId: string, quantity: number) {
        if (quantity < 1) return;
        this.panierService.updateItemQuantity(productId, quantity).subscribe({
            next: (res) => {
                // Optimistic update or reload
                this.panier = res.data;
            },
            error: (err) => {
                console.error('Error updating quantity', err);
                alert('Erreur lors de la mise à jour de la quantité');
            }
        });
    }

    removeItem(productId: string) {
        if (!confirm('Voulez-vous vraiment retirer cet article ?')) return;

        this.panierService.removeFromPanier(productId).subscribe({
            next: (res) => {
                this.panier = res.data;
            },
            error: (err) => {
                console.error('Error removing item', err);
                alert('Erreur lors de la suppression');
            }
        });
    }

    clearPanier() {
        if (!confirm('Voulez-vous vraiment vider votre panier ?')) return;

        this.panierService.clearPanier().subscribe({
            next: (res) => {
                this.panier = res.data; // items: []
            },
            error: (err) => {
                console.error('Error clearing cart', err);
            }
        });
    }

    validerPanier() {
        if (!this.panier || this.panier.items.length === 0) return;

        if (!confirm('Voulez-vous valider votre panier et passer à la commande ?')) return;

        this.panierService.validatePanier().subscribe({
            next: (res) => {
                alert('Commande validée avec succès ! Vous pouvez retrouver vos commandes dans la section Achats.');
                this.panier = { items: [], total: 0 };
                // Optional: redirect to purchases
                // this.router.navigate(['/achats']); 
            },
            error: (err) => {
                console.error('Error validating cart', err);
                alert('Erreur lors de la validation : ' + (err.error?.error || 'Erreur serveur'));
            }
        });
    }
}
