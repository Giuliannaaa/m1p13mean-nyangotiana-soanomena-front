export interface AdminDashboard {
    success: boolean,
    data: {
        activeStores: number,
        activeBuyers: number,
        activePromotions: number,
        inactiveBoutiqueUsers: number,
        totalStores: number,
        totalBuyers: number,
        totalPromotions: number
    }
}