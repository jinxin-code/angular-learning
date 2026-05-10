/**
 * main.ts - Angular 应用入口文件
 *
 * ===== Angular 17+ 新特性 =====
 * 本项目使用 Angular 19，采用函数式引导(Functional Bootstrap)方式
 * 这是 Angular 15.2+ 推荐的引导方式，替代传统的 bootstrapApplication 第一参数+第二参数的写法
 *
 * 【旧方式 - 已废弃】
 * platformBrowserDynamic().bootstrapModule(AppModule)
 *
 * 【新方式 - 推荐】
 * bootstrapApplication() - 函数式引导，直接引导根组件
 */
import { bootstrapApplication } from '@angular/platform-browser';
/** 引入应用配置 - ApplicationConfig 定义了应用的全局提供商 */
import { appConfig } from './app/app.config';
/** 引入根组件 - 整个应用的最顶层组件 */
import { AppComponent } from './app/app.component';

/**
 * bootstrapApplication - 引导 Angular 应用
 *
 * 这是 Angular 17+ 推荐的引导方式：
 * 1. 第一个参数：根组件 (Root Component)
 * 2. 第二个参数：应用配置 (Application Config)
 *
 * 旧方式使用 NgModule，需要创建 AppModule 和 platformBrowserDynamic()
 * 新方式直接引导组件，更简洁，是 Angular 17+ 的标准做法
 *
 * 引导过程：
 * 1. 创建根组件实例
 * 2. 配置依赖注入容器
 * 3. 初始化 Angular 框架
 * 4. 将根组件挂载到 DOM 中
 */
bootstrapApplication(AppComponent, appConfig)
  /** catch 处理引导过程中的错误（如配置错误、依赖注入失败等） */
  .catch((err) => console.error(err));
