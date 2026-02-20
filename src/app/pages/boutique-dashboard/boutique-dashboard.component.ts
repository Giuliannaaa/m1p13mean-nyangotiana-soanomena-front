import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDashboardService } from '../../services/adminDashboard/admin-dashboard.service';
import { forkJoin } from 'rxjs';
import { BoutiqueDashboardService } from '../../services/boutiqueDashboard/boutique-dashboard.service';

interface DonutSlice {
  boutiqueName: string;
  revenue: number;
  percentage: number;
  color: string;
  offset: number;
  dashArray: string;
}

@Component({
  selector: 'app-boutique-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // Donut chart
  donutSlices: DonutSlice[] = [];
  donutTotal: number = 0;
  revenueLoading: boolean = false;

  readonly DONUT_COLORS = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
    '#8b5cf6', '#14b8a6', '#f97316', '#ec4899', '#06b6d4'
  ];

  // Filters
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  readonly months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ];

  readonly years: number[] = (() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => current - i);
  })();

  loading: boolean = true;
  error: string | null = null;

  constructor(private adminDashboardService: AdminDashboardService, private boutiqueDashboardService: BoutiqueDashboardService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      products: this.boutiqueDashboardService.getNumberOfProductInMyStore(),
      outOfStock: this.boutiqueDashboardService.getOutOfStockProducts(),
      topSelling: this.boutiqueDashboardService.getTopSellingProducts(),
      promotions: this.boutiqueDashboardService.getActivePromotionsInMyStore()
    }).subscribe({
      next: (results: any) => {
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
        // Load revenue separately (with filters)
        this.loadRevenue();
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.error = 'Erreur lors du chargement des données.';
        this.loading = false;
      }
    });
  }

  loadRevenue(): void {
    this.revenueLoading = true;
    this.boutiqueDashboardService.getStoreRevenue(this.selectedMonth, this.selectedYear).subscribe({
      next: (result: any) => {
        const revenueData: any[] = result?.data || [];

        // Aggregate revenue per boutique for the selected period
        const boutiqueMap = new Map<string, number>();
        revenueData.forEach((item: any) => {
          const name = item.boutiqueName || 'Boutique';
          boutiqueMap.set(name, (boutiqueMap.get(name) || 0) + (item.revenue || 0));
        });

        // Total revenue
        this.donutTotal = Array.from(boutiqueMap.values()).reduce((s, v) => s + v, 0);
        this.totalRevenue = this.donutTotal;

        // Compute donut slices
        this.donutSlices = this.computeDonutSlices(boutiqueMap);
        this.revenueLoading = false;
      },
      error: (err) => {
        console.error('Error loading revenue', err);
        this.revenueLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadRevenue();
  }

  private computeDonutSlices(boutiqueMap: Map<string, number>): DonutSlice[] {
    const total = this.donutTotal;
    if (total === 0) return [];

    const circumference = 2 * Math.PI * 45; // r=45, viewBox 100x100
    let cumulativeOffset = 0;
    const slices: DonutSlice[] = [];

    let idx = 0;
    boutiqueMap.forEach((revenue, boutiqueName) => {
      const percentage = (revenue / total) * 100;
      const dash = (percentage / 100) * circumference;
      const gap = circumference - dash;

      slices.push({
        boutiqueName,
        revenue,
        percentage,
        color: this.DONUT_COLORS[idx % this.DONUT_COLORS.length],
        offset: circumference - cumulativeOffset,
        dashArray: `${dash} ${gap}`
      });

      cumulativeOffset += dash;
      idx++;
    });

    return slices;
  }

  formatRevenue(value: number): string {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + ' M Ar';
    if (value >= 1_000) return (value / 1_000).toFixed(0) + ' k Ar';
    return value.toFixed(0) + ' Ar';
  }

  get selectedMonthLabel(): string {
    return this.months.find(m => m.value === this.selectedMonth)?.label || '';
  }
}
