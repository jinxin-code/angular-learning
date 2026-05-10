/**
 * routes - 应用路由配置
 *
 * ===== Angular 17+ 路由配置 =====
 *
 * 1. Route 类型 - 显式声明路由配置的类型
 * 2. loadComponent - 懒加载组件的推荐方式
 *
 * ===== 路由配置选项 =====
 *
 * - path: 路由路径
 * - loadComponent: 懒加载组件（Angular 17+ 推荐方式）
 * - pathMatch: 路径匹配策略
 * - redirectTo: 重定向目标
 * - children: 子路由
 */
import { Routes } from '@angular/router';

/**
 * routes - 路由配置数组
 *
 * 【路由顺序】
 * 路由按顺序匹配，宽松路径（如 ''）应放在精确路径（如 'user/:id'）之后
 *
 * 【懒加载】
 * 使用 loadComponent 替代 component，只有访问路由时才加载组件
 * 这样可以减少初始加载时间
 *
 * 【通配符路由】
 * path: '**' 匹配所有未匹配的路径
 * 必须放在路由数组的最后
 */
export const routes: Routes = [
  {
    path: '',
    /** 懒加载组件 - 只有访问该路由时才加载组件 */
    loadComponent: () => import('./user-list/user-list.component').then(m => m.UserListComponent)
  },
  {
    /**
     * 动态路由参数
     * :id 是路由参数，可以在组件中通过 ActivatedRoute 获取
     *
     * 例如：/user/123 → id = '123'
     */
    path: 'user/:id',
    loadComponent: () => import('./user-detail/user-detail.component').then(m => m.UserDetailComponent)
  },
  {
    /** 重定向路由 */
    path: 'home',
    /** 重定向到空路径（首页） */
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    /**
     * 通配符路由 - 匹配所有未匹配的路径
     * 通常用于 404 页面
     */
    path: '**',
    redirectTo: ''
  }
];
