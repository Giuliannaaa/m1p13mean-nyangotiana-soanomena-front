import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ProduitService } from '../../services/produits/produits.service';
import { BoutiqueService } from '../../services/boutique/boutique.service';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Produit } from '../../models/produit.model';
import { Router } from "@angular/router";
import { PanierService } from '../../services/panier/panier.service';


@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './produit-list.component.html',
  styleUrls: ['./produit-list.component.css'],
})
export class ProduitListComponent implements OnInit {
  produits: Produit[] = [];
  filteredProduits: Produit[] = [];

  // Variables pour le filtre de boutique
  boutiques: any[] = [];
  boutique_selectionnee: string = '';

  // Variables pour le filtre de prix
  prix_min: number = 0;
  prix_max: number = 1000000;
  prix_min_range: number = 0;
  prix_max_range: number = 1000000;

  // Variables pour les filtres spéciaux
  filtre_special: string = 'tous';

  // AJOUTER RECHERCHE
  searchText: string = '';

  isFiltering: boolean = false;
  isLoadingSpecial: boolean = false;

  newProduit = {
    store_id: '',
    nom_prod: '',
    descriptions: '',
    prix_unitaire: null,
    stock_etat: true,
    type_produit: 'PRODUIT',
    livraison: {
      disponibilite: false,
      frais: 0
    },
    image_Url: ''
  };

  authService = inject(AuthService);
  private boutiqueService = inject(BoutiqueService);
  private cdr = inject(ChangeDetectorRef);

  isAdmin = false;
  isBoutique = false;
  isAcheteur = false;

  // Modal pour mise à jour du prix
  showPriceModal = false;
  selectedProduct: Produit | null = null;
  updatedPrice: number = 0;

  constructor(private produitService: ProduitService,
    private router: Router,
    private panierService: PanierService
  ) { }

  ngOnInit(): void {
    const role = this.authService.getRole();
    this.isAdmin = role === 'Admin';
    this.isBoutique = role === 'Boutique';
    this.isAcheteur = role === 'Acheteur';

    this.loadProduits();
    this.loadBoutiques();
  }

  loadProduits(): void {
    this.produitService.getProduits().subscribe({
      next: (response) => {
        console.log('Produits reçus:', response);
        this.produits = response.data || response;

        // Calculer le prix max automatiquement
        if (this.produits.length > 0) {
          const maxPrice = Math.max(...this.produits.map(p => {
            const price = p.prix_unitaire?.$numberDecimal
              ? parseFloat(p.prix_unitaire.$numberDecimal)
              : (typeof p.prix_unitaire === 'number' ? p.prix_unitaire : 0);
            return price;
          }));
          this.prix_max_range = Math.ceil(maxPrice * 1.1);
          this.prix_max = this.prix_max_range;
        }

        this.filteredProduits = this.produits;
        this.extractBoutiques();

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error("Erreur lors du chargement des produits", err);
      }
    });
  }

  loadBoutiques(): void {
    this.boutiqueService.getAllBoutiques().subscribe({
      next: (response: any) => {
        console.log('Boutiques reçues:', response);

        if (Array.isArray(response)) {
          this.boutiques = response;
        } else if (response && Array.isArray(response.data)) {
          this.boutiques = response.data;
        } else {
          this.boutiques = [];
        }

        console.log('Boutiques chargées:', this.boutiques);
      },
      error: (err) => {
        console.error('Erreur chargement boutiques:', err);
        this.boutiques = [];
      }
    });
  }

  extractBoutiques(): void {
    const boutiquesMap = new Map();

    this.produits.forEach(produit => {
      if (produit.store_id?._id && produit.store_id?.name) {
        if (!boutiquesMap.has(produit.store_id._id)) {
          boutiquesMap.set(produit.store_id._id, produit.store_id.name);
        }
      }
    });

    const boutiquesFromProduits = Array.from(boutiquesMap, ([id, name]) => ({
      _id: id,
      name: name
    }));

    this.boutiques = [...this.boutiques, ...boutiquesFromProduits];

    const uniqueBoutiques = Array.from(
      new Map(this.boutiques.map(b => [b._id, b])).values()
    );
    this.boutiques = uniqueBoutiques;
  }

  // Charger les produits spéciaux
  loadSpecialProduits(): void {
    this.isLoadingSpecial = true;
    console.log('Filtre spécial:', this.filtre_special);

    let request$;

    switch (this.filtre_special) {
      case 'nouveau':
        request$ = this.produitService.getNewProduits();
        break;
      case 'populaire':
        request$ = this.produitService.getPopularProduits();
        break;
      case 'bestseller':
        request$ = this.produitService.getBestSellerProduits();
        break;
      case 'promo':
        request$ = this.produitService.getPromotedProduits();
        break;
      default:
        this.loadProduits();
        return;
    }

    request$.subscribe({
      next: (response) => {
        console.log('Produits spéciaux reçus:', response);

        this.produits = response.data || response;

        // PAS DE RECALL
        this.filteredProduits = this.produits;

        this.isLoadingSpecial = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement produits spéciaux:', err);
        this.isLoadingSpecial = false;
      }
    });
  }


  // FILTRER LES PRODUITS (avec recherche, boutique, prix et filtre spécial)
  filterProduits(): void {
    // Si un filtre spécial est sélectionné, charger les produits correspondants
    if (this.filtre_special !== 'tous') {
      this.loadSpecialProduits();
      return;
    }

    // Sinon, appliquer les filtres locaux
    this.filteredProduits = this.produits.filter(produit => {
      // Filtrer par boutique
      const matchBoutique = !this.boutique_selectionnee ||
        produit.store_id?._id === this.boutique_selectionnee;

      // Filtrer par prix
      const price = produit.prix_unitaire?.$numberDecimal
        ? parseFloat(produit.prix_unitaire.$numberDecimal)
        : (typeof produit.prix_unitaire === 'number' ? produit.prix_unitaire : 0);

      const matchPrice = price >= this.prix_min && price <= this.prix_max;

      // FILTRER PAR RECHERCHE (nom, description, boutique)
      const searchLower = this.searchText.toLowerCase();
      const boutiqueName = produit.store_id?.name?.toLowerCase() || '';

      const matchSearch = !this.searchText ||
        produit.nom_prod.toLowerCase().includes(searchLower) ||
        (produit.descriptions && produit.descriptions.toLowerCase().includes(searchLower)) ||
        boutiqueName.includes(searchLower);

      return matchBoutique && matchPrice && matchSearch;
    });

    this.isFiltering = this.boutique_selectionnee !== '' ||
      this.prix_min > 0 ||
      this.prix_max < this.prix_max_range ||
      this.searchText !== '';

    console.log('Produits filtrés:', this.filteredProduits.length);
    this.cdr.markForCheck();


    //Anti spam
    if (this.filtre_special !== 'tous') {
      if (!this.isLoadingSpecial) {
        this.loadSpecialProduits();
      }
      return;
    }

  }

  // Réinitialiser les filtres
  resetFilter(): void {
    this.boutique_selectionnee = '';
    this.prix_min = 0;
    this.prix_max = this.prix_max_range;
    this.filtre_special = 'tous';
    this.searchText = ''; // RÉINITIALISER LA RECHERCHE
    this.loadProduits();
    this.isFiltering = false;
    this.cdr.markForCheck();
  }

  deleteProduit(id: string | undefined): void {
    if (!id) {
      alert('ID du produit manquant');
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.produitService.deleteProduit(id).subscribe({
        next: () => {
          alert('Produit supprimé avec succès');
          this.loadProduits();
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  goToBuyProduct(prodId: string | undefined): void {
    if (!prodId) {
      alert('ID du produit manquant');
      return;
    }
    this.router.navigate(['/achats/ajouter', prodId]);
  }

  addToPanier(produit: Produit): void {
    if (!this.isAcheteur) {
      alert("Vous devez être connecté en tant qu'acheteur pour ajouter au panier.");
      return;
    }

    this.panierService.addToPanier(produit._id!, 1).subscribe({
      next: (res) => {
        alert('Produit ajouté au panier !');
      },
      error: (err: string) => {
        console.error(err);
        alert("Erreur lors de l'ajout au panier");
      }
    });
  }

  // AFFICHER TOUS LES BADGES DU PRODUIT
  getProductBadges(produit: Produit): { text: string, color: string }[] {
    const badges: { text: string, color: string }[] = [];

    if (produit.isNew) {
      badges.push({ text: 'NOUVEAU', color: '#28a745' });
    }

    if (produit.isBestSeller) {
      badges.push({ text: 'BEST-SELLER', color: '#ff6b6b' });
    }

    if (produit.isPromoted) {
      badges.push({ text: 'PROMO', color: '#ffc107' });
    }

    if ((produit.purchaseCount || 0) > 50) {
      badges.push({ text: 'POPULAIRE', color: '#007bff' });
    }

    return badges;
  }

  // --- GESTION MODAL PRIX ---
  openPriceModal(produit: Produit): void {
    this.selectedProduct = produit;
    const price = produit.prix_unitaire?.$numberDecimal
      ? parseFloat(produit.prix_unitaire.$numberDecimal)
      : (typeof produit.prix_unitaire === 'number' ? produit.prix_unitaire : 0);
    this.updatedPrice = price;
    this.showPriceModal = true;
  }

  closePriceModal(): void {
    this.showPriceModal = false;
    this.selectedProduct = null;
  }

  updatePrixProduit(): void {
    if (!this.selectedProduct || !this.selectedProduct._id) return;

    this.produitService.updatePrixProduit(this.selectedProduct._id, this.updatedPrice).subscribe({
      next: () => {
        alert('Prix du produit mis à jour avec succès');
        this.closePriceModal();
        this.loadProduits();
      },
      error: (err) => {
        console.error('Erreur mise à jour prix:', err);
        alert('Erreur lors de la mise à jour du prix');
      }
    });
  }
}