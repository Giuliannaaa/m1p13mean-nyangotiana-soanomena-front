import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AchatService } from '../../services/achat.service';

@Component({
  selector: 'app-achat-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './achat-list.component.html',
  styleUrls: ['./achat-list.component.css']
})
export class AchatListComponent implements OnInit {

  achats: any[] = [];

  constructor(private achatService: AchatService) {}

  ngOnInit(): void {
    this.loadAchats();
    
  }

  loadAchats(): void {
    this.achatService.getAchats().subscribe({
      next: (data) => this.achats = data,
      error: (err) => console.error(err)
    });
  }

  deleteAchat(id: string): void {
    if (confirm('Supprimer cet achat ?')) {
      this.achatService.deleteAchat(id).subscribe(() => {
        this.loadAchats();
      });
    }
  }
}
