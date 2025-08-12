import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-site-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="site-detail-container">
      <h2>現場詳情</h2>
      <div class="site-detail-content">
        <p>現場詳情頁面 - DDD架構</p>
        <!-- 這裡將包含現場詳情的具體實現 -->
      </div>
    </div>
  `,
  styles: [
    `
      .site-detail-container {
        padding: 24px;
      }
      .site-detail-content {
        margin-top: 16px;
      }
    `
  ]
})
export class SiteDetailComponent {
  constructor() {}
}

