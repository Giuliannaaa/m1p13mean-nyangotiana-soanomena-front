import { Routes } from '@angular/router';

export const routes: Routes = [
  // ============================================
  // AUTH ROUTES
  // ============================================
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },

  // ============================================
  // DASHBOARD ROUTES
  // ============================================
  { path: 'admin/dashboard', loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
  { path: 'boutique/dashboard', loadComponent: () => import('./pages/boutique-dashboard/boutique-dashboard.component').then(m => m.BoutiqueDashboardComponent) },
  { path: 'buyer/dashboard', loadComponent: () => import('./components/buyer-dashboard/buyer-dashboard.component').then(m => m.BuyerDashboardComponent) },

  // ============================================
  // CATEGORIES CRUD
  // ============================================
  { path: 'categories', loadComponent: () => import('./components/categorie-list/categorie-list.component').then(m => m.CategorieListComponent) },
  { path: 'categories/ajouter', loadComponent: () => import('./components/categorie-add/categorie-add.component').then(m => m.CategorieAddComponent) },
  { path: 'categories/modifier/:id', loadComponent: () => import('./components/categorie-edit/categorie-edit.component').then(m => m.CategorieEditComponent) },

  // ============================================
  // BOUTIQUES ROUTES
  // ============================================
  { path: 'boutiques', loadComponent: () => import('./components/boutique-list/boutique-list.component').then(m => m.BoutiqueListComponent) },
  { path: 'boutiques/ajouter', loadComponent: () => import('./components/boutique-add/boutique-add.component').then(m => m.BoutiqueAddComponent) },
  { path: 'boutiques/modifier/:id', loadComponent: () => import('./components/boutique-edit/boutique-edit.component').then(m => m.BoutiqueEditComponent) },
  { path: 'boutique/:id', loadComponent: () => import('./components/boutique-detail/boutique-detail.component').then(m => m.BoutiqueDetailComponent) },
  { path: 'boutiques/:id', loadComponent: () => import('./components/boutique-detail/boutique-detail.component').then(m => m.BoutiqueDetailComponent) },

  // ============================================
  // PRODUITS ROUTES
  // ============================================
  { path: 'produits', loadComponent: () => import('./components/produit-list/produit-list.component').then(m => m.ProduitListComponent) },
  { path: 'produits/ajouter', loadComponent: () => import('./components/produit-add/produit-add.component').then(m => m.ProduitAddComponent) },
  { path: 'produits/modifier/:id', loadComponent: () => import('./components/produit-edit/produit-edit.component').then(m => m.ProduitEditComponent) },
  { path: 'produits/:id', loadComponent: () => import('./components/produit-detail/produit-detail.component').then(m => m.ProduitDetailComponent) },

  // ============================================
  // PROMOTIONS ROUTES
  // ============================================
  { path: 'promotions', loadComponent: () => import('./components/promotions-list-client/promotions-list-client.component').then(m => m.PromotionsListClientComponent), data: { title: 'Promotions' } },
  { path: 'admin/promotions', loadComponent: () => import('./components/promotion-list/promotion-list.component').then(m => m.PromotionListComponent), data: { title: 'Gestion des promotions' } },
  { path: 'promotions/ajouter', loadComponent: () => import('./components/promotion-add/promotion-add.component').then(m => m.PromotionAddComponent) },
  { path: 'promotions/modifier/:id', loadComponent: () => import('./components/promotion-edit/promotion-edit.component').then(m => m.PromotionEditComponent) },

  // ============================================
  // ACHATS ROUTES
  // ============================================
  { path: 'achats', loadComponent: () => import('./components/achat-list/achat-list.component').then(m => m.AchatListComponent) },
  { path: 'achats/ajouter/:prod_id', loadComponent: () => import('./components/achat-add/achat-add.component').then(m => m.AchatAddComponent) },

  // ============================================
  // PANIER ROUTE
  // ============================================
  { path: 'panier', loadComponent: () => import('./components/panier/panier.component').then(m => m.PanierComponent) },

  // ============================================
  // UTILISATEURS ROUTE
  // ============================================
  { path: 'admin/utilisateurs', loadComponent: () => import('./components/user-list/user-list.component').then(m => m.UserListComponent) },
  { path: 'profile', loadComponent: () => import('./components/user-profile/user-profile.component').then(m => m.UserProfileComponent) },

  // ============================================
  // SUIVI ROUTES
  // ============================================
  { path: 'mes-suivis', loadComponent: () => import('./components/mes-suivis/mes-suivis.component').then(m => m.MesSuivisComponent) },

  // ============================================
  // SIGNALEMENTS ROUTES
  // ============================================
  { path: 'admin/signalements', loadComponent: () => import('./components/signalements-admin/signalements-admin.component').then(m => m.SignalementsAdminComponent) },
  { path: 'mes-signalements', loadComponent: () => import('./components/mes-signalements/mes-signalements.component').then(m => m.MesSignalementsComponent) },
  { path: 'signalement-boutique', loadComponent: () => import('./components/signalement-boutique/signalement-boutique.component').then(m => m.SignalementBoutiqueComponent) },

  // ============================================
  // MESSAGERIE ROUTE
  // ============================================
  { path: 'messagerie', loadComponent: () => import('./components/messagerie/messagerie.component').then(m => m.MessagereieComponent) },
];