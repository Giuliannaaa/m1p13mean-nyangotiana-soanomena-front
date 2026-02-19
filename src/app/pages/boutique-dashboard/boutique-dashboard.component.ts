import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService } from '../../services/adminDashboard/admin-dashboard.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-boutique-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boutique-dashboard.component.html',
  styleUrl: './boutique-dashboard.component.css'
})
export class BoutiqueDashboardComponent implements OnInit {
  // KPI data
  totalRevenue: number = 0;
  numberOfProducts: number = 0;
  outOfStockCount: number = 0;
  topSellingProducts: any[] = [];
  activePromotionsCount: number = 0;

  // Current month revenue
  currentMonthRevenue: number = 0;

  loading: boolean = true;
  error: string | null = null;

  constructor(private adminDashboardService: AdminDashboardService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      revenue: this.adminDashboardService.getStoreRevenue(),
      products: this.adminDashboardService.getNumberOfProductInMyStore(),
      outOfStock: this.adminDashboardService.getOutOfStockProducts(),
      topSelling: this.adminDashboardService.getTopSellingProducts(),
      promotions: this.adminDashboardService.getActivePromotionsInMyStore()
    }).subscribe({
      next: (results) => {
        // Revenue total
        console.log(results);

        // Le backend retourne { success: true, data: [...] }
        const revenueData = results.revenue?.data || [];
        if (revenueData.length > 0) {
          this.totalRevenue = revenueData.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0);

          // Revenue du mois courant
          const now = new Date();
          const currentMonth = now.getMonth() + 1;
          const currentYear = now.getFullYear();
          const monthData = revenueData.filter((item: any) =>
            item.month === currentMonth && item.year === currentYear
          );
          this.currentMonthRevenue = monthData.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0);
        }

        // Nombre de produits — backend retourne { success, data: { boutiques, totalBoutiques, totalProduits } }
        if (results.products?.data) {
          this.numberOfProducts = results.products.data.totalProduits || 0;
        }

        // Rupture de stock — backend retourne { success, data: { count, products } }
        if (results.outOfStock?.data) {
          this.outOfStockCount = results.outOfStock.data.count || 0;
        }

        // Top produits vendus — backend retourne { success, data: [...] }
        if (results.topSelling?.data) {
          this.topSellingProducts = results.topSelling.data || [];
        }

        // Promotions actives — backend retourne { success, data: { count, promotions } }
        if (results.promotions?.data) {
          this.activePromotionsCount = results.promotions.data.count || 0;
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.error = 'Erreur lors du chargement des données.';
        this.loading = false;
      }
    });
  }
}
