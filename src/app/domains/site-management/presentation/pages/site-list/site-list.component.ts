import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-site-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="site-list-container">
      <h2>現場管理</h2>
      <div class="site-list-content">
        <p>現場列表頁面 - DDD架構</p>
        <!-- 這裡將包含現場列表的具體實現 -->
      </div>
    </div>
  `,
  styles: [
    `
      .site-list-container {
        padding: 24px;
      }
      .site-list-content {
        margin-top: 16px;
      }
    `
  ]
})
export class SiteListComponent {
  constructor() {}
}

