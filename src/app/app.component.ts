/**
 * AppComponent - 应用根组件
 *
 * ===== Angular 17+ 新特性 =====
 *
 * 1. Standalone Component（独立组件）
 *    standalone: true 表示这是一个独立组件，不需要在 NgModule 中声明
 *    这是 Angular 14+ 引入的特性，Angular 17+ 中成为默认和推荐方式
 *
 * 2. 直接导入依赖
 *    旧方式需要在 @NgModule.imports 中声明依赖
 *    新方式直接在组件的 imports 数组中导入所需的指令/组件
 */
import { Component } from '@angular/core';
/** RouterOutlet - 路由出口指令，标记路由内容显示的位置 */
import { RouterOutlet } from '@angular/router';

import { ToastComponent } from './toast/toast.component';
import { ToastService } from './toast/toast.service';
import { ToastMessage } from './toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,

  /**
   * imports 数组 - Angular 17+ 新特性
   *
   * 【说明】
   * 独立组件需要在 imports 中明确声明需要使用的指令、组件、Pipe 等
   * 这替代了旧方式中 @NgModule.declarations 的功能
   *
   * 【优势】
   * 1. 更清晰的依赖关系
   * 2. 更好的 tree-shaking
   * 3. 更容易理解组件所需依赖
   * 4. 更好的 IDE 支持和类型检查
   */
  imports: [RouterOutlet, ToastComponent],

  /**
   * template 内联写法
   * Angular 17+ 推荐使用内联模板，可以直接在 .ts 文件中编写模板
   * 也可以使用 templateUrl 引用外部 .html 文件
   */
  template: `
    <!-- 页面容器 -->
    <div class="container">
      <!-- 页面标题头部 -->
      <div class="header">
        <h1>用户管理系统</h1>
      </div>

      <!--
        <router-outlet> 是路由出口
        Angular Router 会根据当前 URL 在这里渲染对应的组件

        【路由对应关系】
        /          -> UserListComponent
        /user/1    -> UserDetailComponent
      -->
      <router-outlet></router-outlet>
    </div>

    <!-- Toast 消息提示组件 - 全局通知层 -->
    <app-toast [messages]="toastMessages"></app-toast>
  `
})
export class AppComponent {
  /** 应用标题 */
  title = 'user-management';

  /** Toast 消息列表 */
  toastMessages: ToastMessage[] = [];

  /**
   * 依赖注入 - 构造函数方式
   *
   * Angular 的依赖注入（DI）系统会自动解析并注入所需的服务
   * TypeScript 的访问修饰符（private/public）会自动创建类属性
   *
   * 【注入方式对比】
   * 方式1（构造函数注入）：constructor(private toastService: ToastService)
   * 方式2（inject 函数）：toastService = inject(ToastService)
   *
   * 【推荐】
   * 两种方式都可以，inject 函数在需要延迟初始化或条件注入时更灵活
   */
  constructor(private toastService: ToastService) {
    this.toastService.messages$.subscribe(messages => {
      this.toastMessages = messages;
    });
  }
}
