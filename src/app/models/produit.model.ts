export interface Produit {
  _id?: string;
  store_id?: any; // Référence à Boutique
  nom_prod: string;
  descriptions?: string;
  prix_unitaire: any; // Decimal128
  stock_etat: boolean;
  type_produit: 'PRODUIT' | 'SERVICE';
  livraison?: {
    disponibilite: boolean;
    frais: number;
  };
  image_Url?: string;
  image_preview?: string;
  
  isNew?: boolean;
  isBestSeller?: boolean;
  isPromoted?: boolean;
  purchaseCount?: number;
  views?: number;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}