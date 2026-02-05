import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService } from '../../services/adminDashboard/admin-dashboard.service';
import { AdminDashboard } from '../../models/adminDashboar.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  dashboardData: AdminDashboard['data'] | null = null;
  loading = true;
  error: string | null = null;

  constructor(private adminDashboardService: AdminDashboardService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.adminDashboardService.getAdminDashboardData().subscribe({
      next: (response) => {
        if (response.success) {
          this.dashboardData = response.data;
        } else {
          this.error = 'Échec du chargement des données';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des données du tableau de bord';
        this.loading = false;
        console.error('Dashboard error:', err);
      }
    });
  }

  getPercentage(active: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((active / total) * 100);
  }

  getAverageActivationRate(): number {
    if (!this.dashboardData) return 0;

    const storesRate = this.getPercentage(this.dashboardData.activeStores, this.dashboardData.totalStores);
    const buyersRate = this.getPercentage(this.dashboardData.activeBuyers, this.dashboardData.totalBuyers);
    const promotionsRate = this.getPercentage(this.dashboardData.activePromotions, this.dashboardData.totalPromotions);

    return Math.round((storesRate + buyersRate + promotionsRate) / 3);
  }
}
