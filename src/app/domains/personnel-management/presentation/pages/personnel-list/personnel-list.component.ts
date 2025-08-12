import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-personnel-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="personnel-list-container">
      <h2>人員管理</h2>
      <div class="personnel-list-content">
        <p>人員列表頁面 - DDD架構</p>
        <!-- 這裡將包含人員列表的具體實現 -->
      </div>
    </div>
  `,
  styles: [
    `
      .personnel-list-container {
        padding: 24px;
      }
      .personnel-list-content {
        margin-top: 16px;
      }
    `
  ]
})
export class PersonnelListComponent {
  constructor() {}
}

