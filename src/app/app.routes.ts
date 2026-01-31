import { Routes } from '@angular/router';
import { ProduitListComponent } from './components/produit-list/produit-list.component';
import { ProduitAddComponent } from './components/produit-add/produit-add.component';
import { ProduitEditComponent } from './components/produit-edit/produit-edit.component';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { BoutiqueDashboardComponent } from './pages/boutique-dashboard/boutique-dashboard.component';
import { BuyerDashboardComponent } from './pages/buyer-dashboard/buyer-dashboard.component';
import { PromotionListComponent } from './components/promotion-list/promotion-list.component';
import { PromotionAddComponent } from './components/promotion-add/promotion-add.component';
import { PromotionEditComponent } from './components/promotion-edit/promotion-edit.component';

//CRUD
import { CategorieAddComponent } from "./components/categorie-add/categorie-add.component";
import { CategorieListComponent } from "./components/categorie-list/categorie-list.component";
import { CategorieEditComponent } from './components/categorie-edit/categorie-edit.component';
import { BoutiqueListComponent } from './components/boutique-list/boutique-list.component';
import { BoutiqueAddComponent } from './components/boutique-add/boutique-add.component';
import { BoutiqueEditComponent } from './components/boutique-edit/boutique-edit.component';
import { UserListComponent } from './components/user-list/user-list.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'admin/dashboard', component: AdminDashboardComponent },
    { path: 'boutique/dashboard', component: BoutiqueDashboardComponent },
    { path: 'buyer/dashboard', component: BuyerDashboardComponent },
    { path: 'categories', component: CategorieListComponent },
    { path: 'categories/ajouter', component: CategorieAddComponent },
    { path: 'categories/modifier/:id', component: CategorieEditComponent },
    { path: 'boutiques', component: BoutiqueListComponent },
    { path: 'boutiques/ajouter', component: BoutiqueAddComponent },
    { path: 'boutiques/modifier/:id', component: BoutiqueEditComponent },
    { path: 'produits', component: ProduitListComponent }, //Route pour produit-list
    { path: 'produits/ajouter', component: ProduitAddComponent },
    { path: 'produits/modifier/:id', component: ProduitEditComponent },

    //CRUD promotion

    { path: 'promotions', component: PromotionListComponent },
    { path: 'promotions/ajouter', component: PromotionAddComponent },
    { path: 'promotions/modifier/:id', component: PromotionEditComponent },
    { path: 'admin/utilisateurs', component: UserListComponent },

];
