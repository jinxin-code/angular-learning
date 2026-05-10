/**
 * app.config.ts - 应用配置文件
 *
 * ===== Angular 17+ 新特性 =====
 * 本文件使用函数式配置方式(Function-based Configuration)
 * 这是 Angular 17+ 推荐的配置模式，替代 NgModule 中的 @NgModule 配置
 *
 * 【旧方式 - NgModule】
 * app.module.ts 中使用 @NgModule({
 *   providers: [...],
 *   imports: [...]
 * })
 *
 * 【新方式 - ApplicationConfig】推荐
 * 直接定义 providers 数组，更简洁、更类型安全
 */

/** ApplicationConfig - 应用配置类型，定义全局提供商 */
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
/** provideRouter - 路由配置函数，Angular 17+ 推荐方式 */
import { provideRouter } from '@angular/router';
/** provideHttpClient - HTTP 客户端配置函数，Angular 15+ 新增 */
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

/**
 * appConfig - 应用配置对象
 *
 * 类型：ApplicationConfig
 * 包含 providers 数组，定义应用中所有可用的服务提供商
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * provideZoneChangeDetection - 区域变化检测配置
     *
     * 【什么是 Zone.js？】
     * Zone.js 是一个用于拦截异步操作（setTimeout、Promise、XMLHttpRequest等）的库
     * Angular 使用 Zone.js 来自动检测异步操作完成，从而触发变更检测
     *
     * 【eventCoalescing 选项】
     * eventCoalescing: true - 优化性能，将多个事件合并为一次更新
     * 例如：同时触发多个点击事件时，只执行一次变更检测
     *
     * 【Angular 18+ 变化】
     * Angular 18 开始，provideZoneChangeDetection 可能会被废弃
     * 取而代之的是 provideExperimentalZonelessChangeDetection（无 Zone.js 变更检测）
     */

    /**
     * provideRouter - 配置路由功能
     *
     * 【函数式配置】
     * Angular 17+ 推荐使用 provideRouter() 函数替代 RouterModule.forRoot()
     *
     * 【withComponentInputBinding()】
     * 启用组件输入属性绑定
     * 允许将路由参数直接作为组件的 @Input() 属性接收
     *
     * 【示例】
     * 路由定义：{ path: 'user/:id', component: UserDetailComponent }
     * 组件定义：@Component({ template: '<div>{{ id }}</div>' })
     * export class UserDetailComponent {
     *   @Input() id!: string;  // 直接接收路由参数，无需注入 ActivatedRoute
     * }
     */
    provideRouter(routes),

    /**
     * provideHttpClient - 配置 HTTP 客户端
     *
     * 【函数式配置】
     * Angular 15+ 引入，替代 HttpClientModule
     *
     * 【作用】
     * 在应用中启用 HttpClient 服务
     * HttpClient 是 Angular 发送 HTTP 请求的主要方式
     *
     * 【常用配置项】
     * withFetch() - 使用 Fetch API 替代 XMLHttpRequest（Angular 15+）
     * withInterceptors() - 注册 HTTP 拦截器
     */
    provideHttpClient()
  ]
};
