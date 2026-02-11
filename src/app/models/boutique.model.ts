import { Categorie } from "./categorie.model";
import { User } from "./user.model";

export interface Boutique {
    _id: string;
    name: string;
    description?: string;
    categoryId?: string;
    category: Categorie;
    ownerId?: string;
    owner?: User;
    isValidated?: boolean;
    legal?: {
        nif?: string;
        stat?: string;
        rent?: string;
    };
    images?: [
        {
            url: string;
            altText?: string;
            isLogo: boolean;
            position: number;
        }
    ];
    isNew?: boolean;
    isPopular?: boolean;
    isFeatured?: boolean;
    rating?: number;
    followers?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
