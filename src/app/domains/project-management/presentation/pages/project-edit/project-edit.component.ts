import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-project-edit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="project-edit-container">
      <h2>專案編輯</h2>
      <div class="project-edit-content">
        <p>專案編輯頁面 - DDD架構</p>
        <!-- 這裡將包含專案編輯的具體實現 -->
      </div>
    </div>
  `,
  styles: [
    `
      .project-edit-container {
        padding: 24px;
      }
      .project-edit-content {
        margin-top: 16px;
      }
    `
  ]
})
export class ProjectEditComponent {
  constructor() {}
}

