export interface Suivi {
  _id?: string;
  client: string; // ID de l'acheteur
  boutique_id: string; // ID de la boutique
  createdAt?: Date;
  updatedAt?: Date;
}