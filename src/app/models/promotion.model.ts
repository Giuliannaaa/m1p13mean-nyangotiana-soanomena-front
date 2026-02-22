import { Produit } from "./produit.model";

export interface Promotion {
    _id?: string;
    prod_id: Produit;
    type_prom: 'POURCENTAGE' | 'MONTANT';
    montant: {
        $numberDecimal: string;
    };
    code_promo: string;
    debut: string;
    fin: string;
    est_Active: boolean;
    createdAt?: string;
    updatedAt?: string;
}
