export interface User {
    _id?: string;
    firstname: string;
    lastname: string;
    email: string;
    role?: string;
    document?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
