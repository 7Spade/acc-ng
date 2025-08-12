import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="project-detail-container">
      <h2>專案詳情</h2>
      <div class="project-detail-content">
        <p>專案詳情頁面 - DDD架構</p>
        <!-- 這裡將包含專案詳情的具體實現 -->
      </div>
    </div>
  `,
  styles: [
    `
      .project-detail-container {
        padding: 24px;
      }
      .project-detail-content {
        margin-top: 16px;
      }
    `
  ]
})
export class ProjectDetailComponent {
  constructor() {}
}

