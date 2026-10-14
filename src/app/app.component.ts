import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastComponent } from './toast/toast.component';
import { ToastService } from './toast/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  template: `
    <div class="container">
      <div class="header">
        <h1>用户管理系统</h1>
      </div>

      <router-outlet></router-outlet>
    </div>

    <app-toast [messages]="toastService.messages()" />
  `,
})
export class AppComponent {
  readonly title = 'user-management';
  readonly toastService = inject(ToastService);
}
