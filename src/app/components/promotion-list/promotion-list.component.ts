import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PromotionService } from '../../services/promotion.service';

@Component({
  selector: 'app-promotion-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './promotion-list.component.html',
})
export class PromotionListComponent implements OnInit {

  promotions: any[] = [];

  constructor(private promotionService: PromotionService) {}

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    this.promotionService.getPromotions().subscribe({
      next: (data) => {
        console.log('Promotions 👀', data);
        this.promotions = data;
      },
      error: (err) => console.error(err)
    });
  }

  deletePromotion(id: string): void {
    if (confirm('Supprimer cette promotion ?')) {
      this.promotionService.deletePromotion(id).subscribe(() => {
        this.loadPromotions();
      });
    }
  }
}
