import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { BoutiqueDashboardComponent } from './pages/boutique-dashboard/boutique-dashboard.component';
import { BuyerDashboardComponent } from './pages/buyer-dashboard/buyer-dashboard.component';

//CRUD
import { CategorieAddComponent } from "./components/categorie-add/categorie-add.component";
import { CategorieListComponent } from "./components/categorie-list/categorie-list.component";
import { CategorieEditComponent } from './components/categorie-edit/categorie-edit.component';

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
];
