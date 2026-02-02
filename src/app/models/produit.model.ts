export interface Produit {
  _id: string;
  nom_prod: string;
  descriptions: string;
  prix_unitaire: {
    $numberDecimal: string;
  };
  stock_etat: boolean;
  type_produit: string;
  livraison?: {
    disponibilite: boolean;
    frais: number;
  };
  image_Url: string;
  image_preview?: string;
  store_id: any;
  createdAt?: Date;
  updatedAt?: Date;
}