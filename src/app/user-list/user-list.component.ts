/**
 * UserListComponent - 用户列表组件
 *
 * ===== Angular 17+ 新特性 - 控制流指令 =====
 *
 * 本组件展示了 Angular 17 引入的新控制流语法：
 *
 * 1. @if / @else - 条件渲染
 *    替代旧的 *ngIf 指令，语法更简洁
 *
 * 2. @for - 循环渲染
 *    替代旧的 *ngFor 指令
 *
 * 3. @switch - 条件切换
 *    替代旧的 *ngSwitch 指令
 *
 * ===== Standalone Component =====
 * standalone: true 表示这是独立组件，无需 NgModule
 */
import { Component, OnInit } from '@angular/core';
/** FormsModule 提供双向数据绑定 [(ngModel)] */
import { FormsModule } from '@angular/forms';
/** CommonModule 提供 ngModel 等指令 */
import { CommonModule } from '@angular/common';
/** RouterLink 用于声明式路由导航，替代旧的 routerLink 属性绑定 */
import { Router, RouterLink } from '@angular/router';

import { User } from '../models/user';
import { UserService } from '../services/user.service';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-user-list',
  standalone: true,

  imports: [FormsModule, CommonModule, RouterLink],

  template: `
    <!-- 新增用户表单卡片 -->
    <div class="card add-user-form">
      <h3>新增用户</h3>

      <div class="form-group">
        <label>姓名</label>
        <input [(ngModel)]="newUser.name" placeholder="请输入姓名">
      </div>
      <div class="form-group">
        <label>用户名</label>
        <input [(ngModel)]="newUser.username" placeholder="请输入用户名">
      </div>
      <div class="form-group">
        <label>邮箱</label>
        <input [(ngModel)]="newUser.email" placeholder="请输入邮箱">
      </div>
      <button class="btn btn-success" (click)="addUser()">新增用户</button>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="card">
      <div class="filters">
        <div class="search-box">
          <input type="text"
                 [(ngModel)]="searchTerm"
                 (input)="searchUsers()"
                 placeholder="搜索姓名或用户名...">
        </div>
        <div class="filter-buttons">
          <button class="btn btn-secondary" (click)="toggleSortByUsername()">
            {{ sortByUsername ? '取消排序' : '按用户名排序' }}
          </button>
          <button class="btn btn-secondary" (click)="toggleEmailFilter()">
            {{ emailFilterActive ? '取消邮箱筛选' : '邮箱S开头筛选' }}
          </button>
          <button class="btn btn-secondary" (click)="resetFilters()">重置</button>
        </div>
      </div>
    </div>

    @if (isLoading) {
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    } @else {
      <div class="user-grid">
        @for (user of filteredUsers; track user.id) {
          <div class="user-card">
            @if (!editingUser || editingUser.id !== user.id) {
              <h3>{{ user.name }}</h3>
              <p><strong>用户名:</strong> {{ user.username }}</p>
              <p><strong>邮箱:</strong> {{ user.email }}</p>
              <div class="actions">
                <button class="btn btn-primary" [routerLink]="['/user', user.id]">查看详情</button>
                <button class="btn btn-secondary" (click)="startEdit(user)">编辑</button>
                <button class="btn btn-danger" (click)="confirmDelete(user)">删除</button>
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
                <input [(ngModel)]="editingUser.email" placeholder="邮箱">
              </div>
              <div class="actions">
                <button class="btn btn-success" (click)="saveEdit()">保存</button>
                <button class="btn btn-secondary" (click)="cancelEdit()">取消</button>
              </div>
            }
          </div>
        }
      </div>
    }

    @if (showDeleteModal) {
      <div class="modal-overlay" (click)="closeDeleteModal($event)">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>确认删除</h3>
          <p>确定要删除用户 {{ userToDelete?.name }} 吗？</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="showDeleteModal = false">取消</button>
            <button class="btn btn-danger" (click)="deleteUser()">确认删除</button>
          </div>
        </div>
      </div>
    }
  `
})
export class UserListComponent implements OnInit {
  /** 用户列表 */
  users: User[] = [];
  /** 筛选后的用户列表 */
  filteredUsers: User[] = [];
  /** 搜索关键词 */
  searchTerm = '';
  /** 当前编辑的用户，null 表示非编辑模式 */
  editingUser: User | null = null;
  /** 新用户表单数据 */
  newUser: Partial<User> = { name: '', username: '', email: '' };
  /** 是否显示删除确认框 */
  showDeleteModal = false;
  /** 要删除的用户对象 */
  userToDelete: User | null = null;
  /** 是否按用户名排序 */
  sortByUsername = false;
  /** 是否启用邮箱筛选 */
  emailFilterActive = false;
  /** 是否正在加载 */
  isLoading = false;

  /**
   * 依赖注入
   *
   * TypeScript 访问修饰符会自动创建类属性：
   * - private userService: UserService → 创建私有属性 userService
   * - public router: Router → 创建公共属性 router
   */
  constructor(
    private userService: UserService,
    private router: Router,
    private toastService: ToastService
  ) {}

  /**
   * ngOnInit - 组件生命周期钩子
   *
   * 【生命周期钩子】
   * Angular 组件有多个生命周期钩子，按执行顺序：
   * constructor → ngOnInit → ngOnChanges → ngDoCheck → ...
   *
   * 【ngOnInit 用途】
   * 适合在这里：
   * - 发送初始数据请求
   * - 初始化组件状态
   * - 执行一次性设置逻辑
   */
  ngOnInit(): void {
    this.loadUsers();
  }

  /** 加载所有用户 */
  loadUsers(): void {
    this.isLoading = true;

    /**
     * subscribe - 订阅 Observable
     *
     * 【RxJS Observable】
     * HttpClient.get() 返回 Observable，而非 Promise
     * Observable 是 RxJS 的核心概念，支持：
     * - 同步/异步数据流
     * - 多个值发射
     * - 强大的操作符（map、filter、catchError 等）
     *
     * 【订阅模式】
     * Observable 被订阅前不会执行
     * subscribe() 触发请求，callback 处理响应
     *
     * 【错误处理】
     * 使用对象形式的 subscribe 可以分别处理 next、error 回调
     */
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  /** 搜索用户 */
  searchUsers(): void {
    this.applyFilters();
  }

  /** 切换排序状态 */
  toggleSortByUsername(): void {
    this.sortByUsername = !this.sortByUsername;
    this.applyFilters();
  }

  /** 切换邮箱筛选状态 */
  toggleEmailFilter(): void {
    this.emailFilterActive = !this.emailFilterActive;
    this.applyFilters();
  }

  /** 重置所有筛选条件 */
  resetFilters(): void {
    this.searchTerm = '';
    this.sortByUsername = false;
    this.emailFilterActive = false;
    /** [...this.users] 创建新数组，避免修改原数组 */
    this.filteredUsers = [...this.users];
  }

  /**
   * 应用所有筛选条件
   * 管道式处理：搜索 → 筛选 → 排序
   */
  applyFilters(): void {
    let result = [...this.users];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term)
      );
    }

    if (this.emailFilterActive) {
      result = result.filter(user => user.email.toLowerCase().startsWith('s'));
    }

    if (this.sortByUsername) {
      /** localeCompare 用于字符串本地化排序 */
      result.sort((a, b) => a.username.localeCompare(b.username));
    }

    this.filteredUsers = result;
  }

  /** 添加新用户 */
  addUser(): void {
    /** 表单验证 */
    if (!this.newUser.name || !this.newUser.username || !this.newUser.email) {
      this.toastService.warning('请填写所有字段');
      return;
    }

    /** 创建用户对象（不含 id，由后端生成） */
    const userData = {
      name: this.newUser.name!,
      username: this.newUser.username!,
      email: this.newUser.email!
    };

    this.userService.createUser(userData).subscribe({
      next: (createdUser) => {
        /** unshift 添加到数组开头 */
        this.users.unshift(createdUser);
        this.applyFilters();
        this.newUser = { name: '', username: '', email: '' };
        this.toastService.success('用户新增成功！');
      },
      error: (err) => {
        console.error('创建用户失败', err);
        this.toastService.error('创建用户失败，请重试');
      }
    });
  }

  /** 开始编辑用户 */
  startEdit(user: User): void {
    /** 展开运算符创建浅拷贝，避免直接修改原对象 */
    this.editingUser = { ...user };
  }

  /** 保存编辑 */
  saveEdit(): void {
    if (!this.editingUser) return;

    this.userService.updateUser(this.editingUser).subscribe({
      next: () => {
        /** findIndex 查找并更新用户数据 */
        const index = this.users.findIndex(u => u.id === this.editingUser!.id);
        if (index !== -1) {
          this.users[index] = { ...this.editingUser! };
          this.applyFilters();
        }
        this.editingUser = null;
        this.toastService.success('用户更新成功！');
      },
      error: (err) => {
        console.error('更新用户失败', err);
        this.toastService.error('更新用户失败，请重试');
      }
    });
  }

  /** 取消编辑 */
  cancelEdit(): void {
    this.editingUser = null;
  }

  /** 显示删除确认框 */
  confirmDelete(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  /** 关闭删除确认框 */
  closeDeleteModal(event: Event): void {
    /** 点击遮罩层时关闭 */
    if ((event.target as Element).classList.contains('modal-overlay')) {
      this.showDeleteModal = false;
    }
  }

  /** 确认删除用户 */
  deleteUser(): void {
    if (!this.userToDelete) return;

    this.userService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        /** filter 创建新数组，排除要删除的用户 */
        this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
        this.applyFilters();
        this.showDeleteModal = false;
        this.userToDelete = null;
        this.toastService.success('用户删除成功！');
      },
      error: (err) => {
        console.error('删除用户失败', err);
        this.toastService.error('删除用户失败，请重试');
      }
    });
  }
}
