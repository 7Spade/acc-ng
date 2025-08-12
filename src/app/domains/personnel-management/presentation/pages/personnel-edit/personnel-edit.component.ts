import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-personnel-edit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="personnel-edit-container">
      <h2>人員編輯</h2>
      <div class="personnel-edit-content">
        <p>人員編輯頁面 - DDD架構</p>
        <!-- 這裡將包含人員編輯的具體實現 -->
      </div>
    </div>
  `,
  styles: [
    `
      .personnel-edit-container {
        padding: 24px;
      }
      .personnel-edit-content {
        margin-top: 16px;
      }
    `
  ]
})
export class PersonnelEditComponent {
  constructor() {}
}

