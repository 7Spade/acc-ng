import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-site-edit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="site-edit-container">
      <h2>現場編輯</h2>
      <div class="site-edit-content">
        <p>現場編輯頁面 - DDD架構</p>
        <!-- 這裡將包含現場編輯的具體實現 -->
      </div>
    </div>
  `,
  styles: [
    `
      .site-edit-container {
        padding: 24px;
      }
      .site-edit-content {
        margin-top: 16px;
      }
    `
  ]
})
export class SiteEditComponent {
  constructor() {}
}

