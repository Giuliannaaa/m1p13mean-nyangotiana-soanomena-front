import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService } from '../../services/adminDashboard/admin-dashboard.service';
import { AdminDashboard } from '../../models/adminDashboar.model';
import { Chart } from 'chart.js';
import { FormsModule } from '@angular/forms';

import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  @ViewChild('revenueCanvas')
  set canvas(element: ElementRef<HTMLCanvasElement>) {
    if (element) {
      this.canvasRef = element;
      this.initChart();
      this.updateChartData();
    }
  }

  canvasRef!: ElementRef<HTMLCanvasElement>;

  dashboardData: AdminDashboard['data'] | null = null;
  revenuePerStore: any[] = [];
  storeCountByCategory: any[] = [];
  top5Stores: any[] = [];
  maxRevenue: number = 0;
  loading = true;
  error: string | null = null;

  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1; // 1-12

  availableYears: number[] = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
  availableMonths = [
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

  private chart: Chart | null = null;

  constructor(private adminDashboardService: AdminDashboardService) { }

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadAdditionalStats();
  }

  ngAfterViewInit(): void {
    this.loadRevenueData(); // Charge les données
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  loadAdditionalStats(): void {
    this.adminDashboardService.getRevenuePerStore().subscribe({
      next: (rawData: any) => {
        const data = rawData.data || rawData;
        if (Array.isArray(data)) {
          this.revenuePerStore = data.map((item: any) => ({
            ...item,
            revenue: item.revenue?.$numberDecimal
              ? Number(item.revenue.$numberDecimal)
              : (typeof item.revenue === 'number' ? item.revenue : 0)
          }));
          this.maxRevenue = Math.max(...this.revenuePerStore.map(item => item.revenue), 1); // Avoid division by zero
        } else {
          console.error('Expected array for revenuePerStore but got:', rawData);
          this.revenuePerStore = [];
        }
      },
      error: (err) => console.error('Error loading revenue per store', err)
    });

    this.adminDashboardService.getStoreCountByCategory().subscribe({
      next: (rawData: any) => {
        const data = rawData.data || rawData;
        if (Array.isArray(data)) {
          this.storeCountByCategory = data;
          // console.log("storeCountByCategory", this.storeCountByCategory);

        } else {
          console.error('Expected array for storeCountByCategory but got:', rawData);
          this.storeCountByCategory = [];
        }
      },
      error: (err) => console.error('Error loading store count by category', err)
    });

    this.adminDashboardService.getTop5Stores().subscribe({
      next: (rawData: any) => {
        const data = rawData.data || rawData;
        if (Array.isArray(data)) {
          this.top5Stores = data;
          // console.log("top5Stores", this.top5Stores);
        } else {
          console.error('Expected array for top5Stores but got:', rawData);
          this.top5Stores = [];
        }
      },
      error: (err) => console.error('Error loading top 5 stores', err)
    });
  }

  private initChart(): void {
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          label: 'Revenu (Ar)',
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const dataset = context.dataset;
                const total = dataset.data.reduce((acc: number, curr: any) => acc + (Number(curr) || 0), 0);
                const percentage = total ? Math.round((value / total) * 100) + '%' : '0%';
                return ` ${label}: ${value.toLocaleString('fr-MG')} Ar (${percentage})`;
              }
            }
          }
        }
      }
    });
  }

  private loadRevenueData(): void {
    this.adminDashboardService.getRevenuePerStore(this.selectedYear, this.selectedMonth).subscribe({
      next: (rawData: any) => {
        const data = rawData.data || rawData;
        if (Array.isArray(data)) {
          this.revenuePerStore = data.map((item: any) => ({
            ...item,
            revenue: item.revenue?.$numberDecimal
              ? Number(item.revenue.$numberDecimal)
              : (typeof item.revenue === 'number' ? item.revenue : 0)
          }));
          this.updateChartData();
        }
      },
      error: (err) => console.error('Error loading revenue per store', err)
    });
  }

  onFilterSubmit(): void {
    console.log('Filter submitted:', this.selectedYear, this.selectedMonth);
    this.loadRevenueData();
  }

  private updateChartData(): void {
    if (this.chart && this.revenuePerStore.length > 0) {
      this.chart.data.labels = this.revenuePerStore.map(i => i.boutiqueName);
      this.chart.data.datasets[0].data = this.revenuePerStore.map(i => i.revenue);

      const backgroundColors = [
        '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e',
        '#f59e0b', '#fbbf24', '#10b981', '#06b6d4', '#3b82f6'
      ];

      this.chart.data.datasets[0].backgroundColor = this.revenuePerStore.map((_, idx) =>
        backgroundColors[idx % backgroundColors.length]
      );
      this.chart.data.datasets[0].borderColor = '#ffffff';

      this.chart.update();
    }
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
