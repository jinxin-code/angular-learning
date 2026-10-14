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
        <h1>{{ title }}</h1>
      </div>

      <router-outlet></router-outlet>
    </div>

    <app-toast [messages]="toastService.messages()" />
  `,
})
export class AppComponent {
  readonly title = '用户管理系统';
  readonly toastService = inject(ToastService);
}
