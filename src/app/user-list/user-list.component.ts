import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { User } from '../models/user';
import { UserService } from '../services/user.service';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-user-list',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="card add-user-form">
      <h3>新增用户</h3>

      <div class="form-group">
        <label for="new-user-name">姓名</label>
        <input id="new-user-name" [(ngModel)]="newUser.name" placeholder="请输入姓名">
      </div>
      <div class="form-group">
        <label for="new-user-username">用户名</label>
        <input id="new-user-username" [(ngModel)]="newUser.username" placeholder="请输入用户名">
      </div>
      <div class="form-group">
        <label for="new-user-email">邮箱</label>
        <input id="new-user-email" type="email" [(ngModel)]="newUser.email" placeholder="请输入邮箱">
      </div>
      <button type="button" class="btn btn-success" (click)="addUser()">新增用户</button>
    </div>

    <div class="card">
      <div class="filters">
        <div class="search-box">
          <input
            type="text"
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
            placeholder="搜索姓名或用户名..."
            aria-label="搜索用户"
          >
        </div>
        <div class="filter-buttons">
          <button type="button" class="btn btn-secondary" (click)="toggleSortByUsername()">
            {{ sortByUsername() ? '取消排序' : '按用户名排序' }}
          </button>
          <button type="button" class="btn btn-secondary" (click)="toggleEmailFilter()">
            {{ emailFilterActive() ? '取消邮箱筛选' : '邮箱 S 开头筛选' }}
          </button>
          <button type="button" class="btn btn-secondary" (click)="resetFilters()">重置</button>
        </div>
      </div>
    </div>

    @if (isLoading()) {
      <div class="loading-container">
        <div class="loading-spinner" aria-hidden="true"></div>
        <p>加载中...</p>
      </div>
    } @else if (errorMessage()) {
      <div class="card error-card" role="alert">
        <p>{{ errorMessage() }}</p>
        <button type="button" class="btn btn-primary" (click)="loadUsers()">重试</button>
      </div>
    } @else {
      <div class="user-grid">
        @for (user of filteredUsers(); track user.id) {
          <div class="user-card">
            @if (editingUser?.id !== user.id) {
              <h3>{{ user.name }}</h3>
              <p><strong>用户名:</strong> {{ user.username }}</p>
              <p><strong>邮箱:</strong> {{ user.email }}</p>
              <div class="actions">
                <button type="button" class="btn btn-primary" [routerLink]="['/user', user.id]">查看详情</button>
                <button type="button" class="btn btn-secondary" (click)="startEdit(user)">编辑</button>
                <button type="button" class="btn btn-danger" (click)="confirmDelete(user)">删除</button>
              </div>
            } @else {
              <div class="form-group">
                <label>姓名</label>
                <input [(ngModel)]="editingUser.name" placeholder="姓名">
              </div>
              <div class="form-group">
                <label>用户名</label>
                <input [(ngModel)]="editingUser.username" placeholder="用户名">
              </div>
              <div class="form-group">
                <label>邮箱</label>
                <input type="email" [(ngModel)]="editingUser.email" placeholder="邮箱">
              </div>
              <div class="actions">
                <button type="button" class="btn btn-success" (click)="saveEdit()">保存</button>
                <button type="button" class="btn btn-secondary" (click)="cancelEdit()">取消</button>
              </div>
            }
          </div>
        }
      </div>
    }

    @if (showDeleteModal()) {
      <div class="modal-overlay" (click)="closeDeleteModal($event)">
        <div class="modal" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
          <h3>确认删除</h3>
          <p>确定要删除用户 {{ userToDelete()?.name }} 吗？</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="closeDeleteModal()">取消</button>
            <button type="button" class="btn btn-danger" (click)="deleteUser()">确认删除</button>
          </div>
        </div>
      </div>
    }
  `
})
export class UserListComponent {
  readonly users = signal<User[]>([]);
  readonly searchTerm = signal('');
  readonly sortByUsername = signal(false);
  readonly emailFilterActive = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showDeleteModal = signal(false);
  readonly userToDelete = signal<User | null>(null);

  /** 根据搜索、排序和筛选条件派生当前列表。 */
  readonly filteredUsers = computed(() => {
    let result = [...this.users()];
    const keyword = this.searchTerm().trim().toLowerCase();

    if (keyword) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(keyword) ||
        user.username.toLowerCase().includes(keyword)
      );
    }

    if (this.emailFilterActive()) {
      result = result.filter(user => user.email.toLowerCase().startsWith('s'));
    }

    if (this.sortByUsername()) {
      result.sort((a, b) => a.username.localeCompare(b.username));
    }

    return result;
  });

  editingUser: User | null = null;
  newUser: Pick<User, 'name' | 'username' | 'email'> = {
    name: '',
    username: '',
    email: ''
  };

  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  /** 忽略已过期的列表请求，避免慢响应覆盖较新的 API 源数据。 */
  private loadRequestId = 0;

  constructor() {
    effect(() => {
      this.userService.apiSource();
      this.loadUsers();
    });
  }

  loadUsers(): void {
    const requestId = ++this.loadRequestId;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService.getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: users => {
          if (requestId !== this.loadRequestId) {
            return;
          }
          this.users.set(users);
          this.isLoading.set(false);
        },
        error: error => {
          if (requestId !== this.loadRequestId) {
            return;
          }
          console.error('加载用户列表失败:', error);
          this.isLoading.set(false);
          this.errorMessage.set('用户列表加载失败，请检查后端服务或网络后重试。');
        }
      });
  }

  toggleSortByUsername(): void {
    this.sortByUsername.update(value => !value);
  }

  toggleEmailFilter(): void {
    this.emailFilterActive.update(value => !value);
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.sortByUsername.set(false);
    this.emailFilterActive.set(false);
  }

  addUser(): void {
    const name = this.newUser.name.trim();
    const username = this.newUser.username.trim();
    const email = this.newUser.email.trim();

    if (!name || !username || !email) {
      this.toastService.warning('请填写所有字段');
      return;
    }

    this.userService.createUser({ name, username, email })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: createdUser => {
          this.users.update(list => [createdUser, ...list]);
          this.newUser = { name: '', username: '', email: '' };
          this.toastService.success('用户新增成功！');
        },
        error: error => {
          console.error('创建用户失败:', error);
          this.toastService.error('创建用户失败，请重试');
        }
      });
  }

  startEdit(user: User): void {
    this.editingUser = { ...user };
  }

  saveEdit(): void {
    if (!this.editingUser) {
      return;
    }

    const editingUser = this.editingUser;
    this.userService.updateUser(editingUser)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updatedUser => {
          this.users.update(list =>
            list.map(user => user.id === updatedUser.id ? { ...updatedUser } : user)
          );
          this.editingUser = null;
          this.toastService.success('用户更新成功！');
        },
        error: error => {
          console.error('更新用户失败:', error);
          this.toastService.error('更新用户失败，请重试');
        }
      });
  }

  cancelEdit(): void {
    this.editingUser = null;
  }

  confirmDelete(user: User): void {
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(event?: Event): void {
    if (event && event.target !== event.currentTarget) {
      return;
    }
    this.showDeleteModal.set(false);
  }

  deleteUser(): void {
    const target = this.userToDelete();
    if (!target) {
      return;
    }

    this.userService.deleteUser(target.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.users.update(list => list.filter(user => user.id !== target.id));
          this.showDeleteModal.set(false);
          this.userToDelete.set(null);
          this.toastService.success('用户删除成功！');
        },
        error: error => {
          console.error('删除用户失败:', error);
          this.toastService.error('删除用户失败，请重试');
        }
      });
  }
}
