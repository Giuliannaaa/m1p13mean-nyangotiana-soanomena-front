import { Promotion } from "./promotion.model"
import { User } from "./user.model"

export interface AdminDashboard {
    success: boolean,
    data: {
        activeStores: number,
        activeBuyers: number,
        activePromotions: number,
        inactiveBoutiqueUsers: number,
        totalStores: number,
        totalBuyers: number,
        totalPromotions: number,
        inactiveBoutiqueUsersData?: User[],
        activePromotionsData?: Promotion[]
    }
}