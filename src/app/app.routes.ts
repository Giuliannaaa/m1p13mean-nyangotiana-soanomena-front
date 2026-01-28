import { Routes } from '@angular/router';
import { ProduitListComponent } from './components/produit-list/produit-list.component';
import { ProduitAddComponent } from './components/produit-add/produit-add.component';
import { ProduitEditComponent } from './components/produit-edit/produit-edit.component';

export const routes: Routes = [
    { path: 'produits', component: ProduitListComponent}, //Route pour produit-list
    { path: 'produits/ajouter', component: ProduitAddComponent },
    { path: 'produits/modifier/:id', component: ProduitEditComponent },
];
