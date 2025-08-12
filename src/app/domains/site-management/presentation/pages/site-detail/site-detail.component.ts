import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-site-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="site-detail-container">
      <h2>場地詳情</h2>
      <div class="site-detail-content">
        <p>場地詳情頁面 - DDD架構</p>
        <!-- 這裡將包含場地詳情的具體實現 -->
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

