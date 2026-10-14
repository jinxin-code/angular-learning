import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-detail',
  imports: [RouterLink],
  template: `
    @if (loading()) {
      <div class="card">
        <p>加载中...</p>
      </div>
    } @else if (user()) {
      @let currentUser = user()!;
      <div class="card">
        <h2>{{ currentUser.name }} 的详细信息</h2>
        <div class="detail-info">
          <p><span>ID:</span> {{ currentUser.id }}</p>
          <p><span>姓名:</span> {{ currentUser.name }}</p>
          <p><span>用户名:</span> {{ currentUser.username }}</p>
          <p><span>邮箱:</span> {{ currentUser.email }}</p>

          @if (currentUser.phone) {
            <p><span>电话:</span> {{ currentUser.phone }}</p>
          }
          @if (currentUser.website) {
            <p><span>网站:</span> {{ currentUser.website }}</p>
          }

          @if (currentUser.address) {
            <div>
              <h3>地址</h3>
              <p><span>街道:</span> {{ currentUser.address.street }}</p>
              <p><span>套房:</span> {{ currentUser.address.suite }}</p>
              <p><span>城市:</span> {{ currentUser.address.city }}</p>
              <p><span>邮编:</span> {{ currentUser.address.zipcode }}</p>
            </div>
          }

          @if (currentUser.company) {
            <div>
              <h3>公司</h3>
              <p><span>公司名称:</span> {{ currentUser.company.name }}</p>
              <p><span>标语:</span> {{ currentUser.company.catchPhrase }}</p>
              <p><span>业务:</span> {{ currentUser.company.bs }}</p>
            </div>
          }
        </div>

        <div style="margin-top: 20px;">
          <button type="button" class="btn btn-primary" routerLink="/">返回列表</button>
        </div>
      </div>
    } @else {
      <div class="card">
        <p>未找到该用户</p>
        <button type="button" class="btn btn-primary" routerLink="/">返回列表</button>
      </div>
    }
  `
})
export class UserDetailComponent {
  readonly user = signal<User | null>(null);
  readonly loading = signal(true);

  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userId = Number(this.route.snapshot.paramMap.get('id'));
  private loadRequestId = 0;

  constructor() {
    effect(() => {
      this.userService.apiSource();
      this.loadUser();
    });
  }

  private loadUser(): void {
    if (!Number.isInteger(this.userId) || this.userId <= 0) {
      this.user.set(null);
      this.loading.set(false);
      return;
    }

    const requestId = ++this.loadRequestId;
    this.loading.set(true);
    this.user.set(null);

    this.userService.getUser(this.userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: user => {
          if (requestId !== this.loadRequestId) {
            return;
          }
          this.user.set(user);
          this.loading.set(false);
        },
        error: error => {
          if (requestId !== this.loadRequestId) {
            return;
          }
          console.error('加载用户详情失败:', error);
          this.user.set(null);
          this.loading.set(false);
        }
      });
  }
}
