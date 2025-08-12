import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-site-edit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="site-edit-container">
      <h2>場地編輯</h2>
      <div class="site-edit-content">
        <p>場地編輯頁面 - DDD架構</p>
        <!-- 這裡將包含場地編輯的具體實現 -->
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

