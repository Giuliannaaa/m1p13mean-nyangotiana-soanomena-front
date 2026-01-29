import { Component } from '@angular/core';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    template: `
    <div style="padding: 2rem; color: white;">
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin area.</p>
    </div>
  `
})
export class AdminDashboardComponent { }
