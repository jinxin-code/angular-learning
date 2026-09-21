/**
 * AppComponent - 应用根组件
 *
 * ===== Angular 信号 (Signal) 改造 =====
 *
 * 原实现：constructor 注入 ToastService → subscribe(messages$) → 赋值 toastMessages
 * 现实现：直接读取 ToastService 的 messages signal，模板里用 messages()
 *
 * 【收益】
 * - 无需 subscribe / 无需手动退订
 * - signal 变化时模板自动重渲染（zone.js + signal 双重驱动）
 * - 代码更少、更不容易内存泄漏
 *
 * ===== Standalone Component（独立组件）=====
 * Angular 19+ 起 standalone 默认为 true，可省略该字段
 */
import { Component, inject } from '@angular/core';
/** RouterOutlet - 路由出口指令，标记路由内容显示的位置 */
import { RouterOutlet } from '@angular/router';

import { ToastComponent } from './toast/toast.component';
import { ToastService } from './toast/toast.service';

@Component({
  selector: 'app-root',

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

    <!--
      Toast 消息提示组件 - 全局通知层
      直接把 ToastService 的 signal 传给子组件的 input()
      messages() 读取 signal 当前值；signal 变化时此绑定自动更新
    -->
    <app-toast [messages]="toastService.messages()" />
  `
})
export class AppComponent {
  /** 应用标题 */
  title = 'user-management';

  /**
   * inject() - 函数式依赖注入（Angular 14+）
   *
   * 【对比构造函数注入】
   * - 构造函数：constructor(private toastService: ToastService)
   * - inject 函数：toastService = inject(ToastService)
   *
   * 【推荐 inject 的场景】
   * - 与 signal/computed 组合更自然（字段初始化即可用）
   * - 继承场景下子类无需重写构造函数
   *
   * 这里直接暴露 toastService，模板读取其 messages signal
   */
  toastService = inject(ToastService);
}
