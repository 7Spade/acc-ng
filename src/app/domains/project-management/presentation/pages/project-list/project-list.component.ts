import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="project-list-container">
      <h2>專案管理</h2>
      <div class="project-list-content">
        <p>專案列表頁面 - DDD架構</p>
        <!-- 這裡將包含專案列表的具體實現 -->
      </div>
    </div>
  `,
  styles: [
    `
      .project-list-container {
        padding: 24px;
      }
      .project-list-content {
        margin-top: 16px;
      }
    `
  ]
})
export class ProjectListComponent {
  constructor() {}
}

