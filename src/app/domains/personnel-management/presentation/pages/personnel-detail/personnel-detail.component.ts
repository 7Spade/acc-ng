import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-personnel-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="personnel-detail-container">
      <h2>人員詳情</h2>
      <div class="personnel-detail-content">
        <p>人員詳情頁面 - DDD架構</p>
        <!-- 這裡將包含人員詳情的具體實現 -->
      </div>
    </div>
  `,
  styles: [
    `
      .personnel-detail-container {
        padding: 24px;
      }
      .personnel-detail-content {
        margin-top: 16px;
      }
    `
  ]
})
export class PersonnelDetailComponent {
  constructor() {}
}

