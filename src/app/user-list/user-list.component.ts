/**
 * UserListComponent - 用户列表组件
 *
 * ===== Angular 信号 (Signal) 改造 =====
 *
 * 本组件演示 signal 体系的核心三件套：
 *
 * 1. signal() - 可写状态
 *    users / searchTerm / sortByUsername / emailFilterActive / isLoading
 *    / showDeleteModal / userToDelete 都改为 signal
 *
 * 2. computed() - 派生状态（关键收益）
 *    filteredUsers = computed(() => 基于 users/searchTerm/... 计算)
 *    → 任意依赖 signal 变化时自动重算，无需手动调用 applyFilters()
 *    原实现里每次 add/edit/delete/search/sort/filter 都要手动 applyFilters()，
 *    现在完全交给 computed 自动追踪依赖，更不易出 bug
 *
 * 3. 模板中读取 signal 需调用：users()、filteredUsers()、isLoading() 等
 *
 * ===== 仍保留为普通字段的场景 =====
 * - newUser / editingUser：表单字段，通过 [(ngModel)] 双向绑定到对象属性，
 *   ngModel 对 signal 没有原生双向支持，故保留普通对象（zone.js 驱动 CD）
 *
 * ===== Angular 17+ 控制流指令 =====
 * @if / @for / @else 仍照常使用（控制流本身与 signal 无冲突）
 *
 * ===== Standalone Component =====
 * Angular 19+ 起 standalone 默认为 true，可省略 standalone 字段
 */
import { Component, OnInit, computed, signal } from '@angular/core';
/** FormsModule 提供 ngModel 指令（双向数据绑定） */
import { FormsModule } from '@angular/forms';
/** CommonModule 提供部分内置指令（此处保留兼容） */
import { CommonModule } from '@angular/common';
/** RouterLink 用于声明式路由导航 */
import { RouterLink } from '@angular/router';

import { User } from '../models/user';
import { UserService } from '../services/user.service';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-user-list',

  imports: [FormsModule, CommonModule, RouterLink],

  template: `
    <!-- 新增用户表单卡片 -->
    <div class="card add-user-form">
      <h3>新增用户</h3>

      <!-- newUser 仍是普通对象，[(ngModel)] 双向绑定到其属性 -->
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
          <!--
            信号与 ngModel 的协作：
            [ngModel]="searchTerm()" 读取 signal 当前值
            (ngModelChange)="searchTerm.set($event)" 写回 signal
            一旦 searchTerm 变化，下方 filteredUsers computed 自动重算
            —— 无需再写 (input)="searchUsers()" 这样的手动触发
          -->
          <input type="text"
                 [ngModel]="searchTerm()"
                 (ngModelChange)="searchTerm.set($event)"
                 placeholder="搜索姓名或用户名...">
        </div>
        <div class="filter-buttons">
          <button class="btn btn-secondary" (click)="toggleSortByUsername()">
            {{ sortByUsername() ? '取消排序' : '按用户名排序' }}
          </button>
          <button class="btn btn-secondary" (click)="toggleEmailFilter()">
            {{ emailFilterActive() ? '取消邮箱筛选' : '邮箱S开头筛选' }}
          </button>
          <button class="btn btn-secondary" (click)="resetFilters()">重置</button>
        </div>
      </div>
    </div>

    @if (isLoading()) {
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    } @else {
      <div class="user-grid">
        @for (user of filteredUsers(); track user.id) {
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

    @if (showDeleteModal()) {
      <div class="modal-overlay" (click)="closeDeleteModal($event)">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>确认删除</h3>
          <p>确定要删除用户 {{ userToDelete()?.name }} 吗？</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="showDeleteModal.set(false)">取消</button>
            <button class="btn btn-danger" (click)="deleteUser()">确认删除</button>
          </div>
        </div>
      </div>
    }
  `
})
export class UserListComponent implements OnInit {
  /**
   * ===== signal 状态字段 =====
   * 读取：在 TS 中用 this.users()，在模板中用 users()
   * 写入：this.users.set(newValue) 或 this.users.update(prev => newValue)
   */
  /** 用户列表 */
  readonly users = signal<User[]>([]);
  /** 搜索关键词 */
  readonly searchTerm = signal('');
  /** 是否按用户名排序 */
  readonly sortByUsername = signal(false);
  /** 是否启用邮箱筛选 */
  readonly emailFilterActive = signal(false);
  /** 是否正在加载 */
  readonly isLoading = signal(false);
  /** 是否显示删除确认框 */
  readonly showDeleteModal = signal(false);
  /** 要删除的用户对象 */
  readonly userToDelete = signal<User | null>(null);

  /**
   * computed - 派生 signal
   *
   * 【依赖追踪】
   * 回调内读取的每个 signal（users()、searchTerm()、
   * emailFilterActive()、sortByUsername()）都成为依赖
   * 任一变化时，filteredUsers 自动重算
   *
   * 【对比原实现】
   * 原来需要在 searchUsers/toggleSortByUsername/toggleEmailFilter
   * /resetFilters/addUser/saveEdit/deleteUser 里手动调用 applyFilters()
   * 现在全部删除 —— 增删改只需更新 users signal，列表自动同步
   *
   * 【惰性求值】
   * computed 只在被读取时才计算，且结果会被缓存，
   * 依赖未变化时多次读取只算一次
   */
  readonly filteredUsers = computed(() => {
    let result = [...this.users()];

    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term)
      );
    }

    if (this.emailFilterActive()) {
      result = result.filter(user => user.email.toLowerCase().startsWith('s'));
    }

    if (this.sortByUsername()) {
      /** localeCompare 用于字符串本地化排序 */
      result.sort((a, b) => a.username.localeCompare(b.username));
    }

    return result;
  });

  /**
   * 仍保留为普通对象的表单状态
   * （ngModel 双向绑定到对象属性，无需 signal 驱动）
   */
  /** 当前编辑的用户，null 表示非编辑模式 */
  editingUser: User | null = null;
  /** 新用户表单数据 */
  newUser: Partial<User> = { name: '', username: '', email: '' };

  /**
   * 依赖注入（构造函数方式，保留以与 inject() 写法形成对比）
   */
  constructor(
    private userService: UserService,
    private toastService: ToastService
  ) {}

  /**
   * ngOnInit - 组件生命周期钩子
   */
  ngOnInit(): void {
    this.loadUsers();
  }

  /** 加载所有用户 */
  loadUsers(): void {
    this.isLoading.set(true);

    /**
     * HttpClient 返回 Observable，subscribe 触发请求
     * 拿到数据后只需 set users signal，filteredUsers 会自动重算
     */
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  /** 切换排序状态（不再需要手动 applyFilters） */
  toggleSortByUsername(): void {
    this.sortByUsername.update(v => !v);
  }

  /** 切换邮箱筛选状态 */
  toggleEmailFilter(): void {
    this.emailFilterActive.update(v => !v);
  }

  /** 重置所有筛选条件 */
  resetFilters(): void {
    this.searchTerm.set('');
    this.sortByUsername.set(false);
    this.emailFilterActive.set(false);
    // users signal 未变，filteredUsers computed 自动重算为完整列表
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
        /**
         * signal.update - 基于前值更新
         * 新用户插到列表头部，filteredUsers computed 自动重算
         */
        this.users.update(list => [createdUser, ...list]);
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

    const editing = this.editingUser;
    this.userService.updateUser(editing).subscribe({
      next: () => {
        /**
         * 不可变更新：返回新数组、替换对应项
         * signal 需要新引用才能触发依赖更新
         */
        this.users.update(list =>
          list.map(u => u.id === editing.id ? { ...editing } : u)
        );
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
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
  }

  /** 关闭删除确认框 */
  closeDeleteModal(event: Event): void {
    /** 点击遮罩层时关闭 */
    if ((event.target as Element).classList.contains('modal-overlay')) {
      this.showDeleteModal.set(false);
    }
  }

  /** 确认删除用户 */
  deleteUser(): void {
    const target = this.userToDelete();
    if (!target) return;

    this.userService.deleteUser(target.id).subscribe({
      next: () => {
        /** filter 创建新数组，排除要删除的用户，computed 自动重算 */
        this.users.update(list => list.filter(u => u.id !== target.id));
        this.showDeleteModal.set(false);
        this.userToDelete.set(null);
        this.toastService.success('用户删除成功！');
      },
      error: (err) => {
        console.error('删除用户失败', err);
        this.toastService.error('删除用户失败，请重试');
      }
    });
  }
}
