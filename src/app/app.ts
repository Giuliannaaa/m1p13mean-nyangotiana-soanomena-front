import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf
import { AuthService } from './services/auth.service';
import { PanierService } from './services/panier.service';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { NavbarComponent } from './components/layout/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent, NavbarComponent, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  authService = inject(AuthService);
  router = inject(Router);
  panierService = inject(PanierService); // Inject PanierService

  protected readonly title = signal('m1p13mean-nyangotiana-soanomena-front');

  // Modal State
  isCartModalOpen = false;
  cartData: any = null;
  avec_livraison = false;
  fraisLivraison = 3000; // Frais fixe pour l'instant

  // Helper to determine if header should be shown
  get showHeader(): boolean {
    const currentUrl = this.router.url;
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isAuthPage = authRoutes.some(route => currentUrl.startsWith(route));
    return this.authService.isAuthenticated() && !isAuthPage;
  }

  get showSidebar(): boolean {
    return this.authService.getRole() === 'Admin' && this.showHeader;
  }

  get isAcheteur(): boolean {
    return this.authService.getRole() === 'Acheteur' && this.showHeader;
  }

  logout() {
    this.authService.logout();
  }

  // Cart Modal Logic
  openCartModal() {
    this.isCartModalOpen = true;
    this.loadCart();
  }

  closeCartModal() {
    this.isCartModalOpen = false;
    this.avec_livraison = false;
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

  updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) return;
    this.panierService.updateItemQuantity(productId, quantity).subscribe({
      next: (res) => {
        this.cartData = res.data;
      },
      error: (err) => {
        alert("Erreur lors de la mise à jour");
      }
    });
  }

  get totalAvecLivraison(): number {
    if (!this.cartData) return 0;
    return this.cartData.total + (this.avec_livraison ? this.fraisLivraison : 0);
  }

  validateCart() {
    if (!confirm('Voulez-vous valider votre panier ?')) return;

    this.panierService.validatePanier(this.avec_livraison).subscribe({
      next: (res) => {
        alert('Commande validée avec succès !');
        this.closeCartModal();
        this.cartData = { items: [], total: 0 };
        // Redirect to purchases page
        this.router.navigate(['/api/achats']);
      },
      error: (err) => {
        alert('Erreur lors de la validation: ' + (err.error?.error || 'Erreur serveur'));
      }
    });
  }

  removeFromPanier(productId: string) {
    if (!confirm('Voulez-vous retirer ce produit de votre panier ?')) return;

    this.panierService.removeFromPanier(productId).subscribe({
      next: (res) => {
        this.cartData = res.data;
      },
      error: (err) => {
        alert("Erreur lors de la suppression");
      }
    });
  }
}
