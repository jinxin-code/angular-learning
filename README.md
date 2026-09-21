# 用户管理

本项目基于 [Angular CLI](https://github.com/angular/angular-cli) 22.1 版本生成，已升级到 Angular 22 并引入 Signal 响应式。

## 项目结构

```
angular-learning/
├── src/                          # Angular 前端
│   ├── app/
│   │   ├── toast/               # Toast 通知组件
│   │   ├── services/            # 用户服务
│   │   ├── user-list/           # 用户列表组件
│   │   └── user-detail/         # 用户详情组件
├── backend/                      # NestJS 后端
│   ├── src/
│   │   ├── users/               # 用户相关模块
│   │   └── events/             # SSE 事件控制器
├── database.sqlite              # SQLite 数据库
└── README.md
```

## 技术栈

- **前端**: Angular 22, TypeScript 6.0, RxJS, Angular Router, Signals
- **后端**: NestJS 11, TypeORM, SQLite
- **API**: RESTful API + Server-Sent Events (SSE)
- **构建**: @angular/build（esbuild/Vite，已从 webpack 版 @angular-devkit/build-angular 迁移）

## 快速开始

### 1. 安装依赖

```bash
# 前端依赖
npm install

# 后端依赖
cd backend && npm install
```

### 2. 启动服务

**终端 1 - 前端 (Angular)**:
```bash
npm start
# 访问: http://localhost:4200
```

**终端 2 - 后端 (NestJS)**:
```bash
cd backend
npm run start:dev
# 访问: http://localhost:3000
```

## 功能特性

### 用户管理
- 用户列表展示，支持搜索和筛选
- 创建、编辑、删除用户
- 用户详情查看

### Toast 通知
- 四种消息类型：success、error、warning、info
- 3秒后自动消失
- 支持手动关闭

### 加载状态
- 数据加载时显示旋转动画
- 用户友好的加载提示

### Signal 响应式改造

前端已从传统 RxJS 订阅模式迁移到 Angular Signal 响应式体系：

- `signal()` 持有可写状态（如 `users`、`isLoading`、`user`）
- `computed()` 派生状态 —— `filteredUsers` 自动依赖 `users`/`searchTerm`/排序与筛选条件，无需手动调用 `applyFilters()`
- `input()` 信号输入替代 `@Input()` 装饰器（ToastComponent）
- `effect()` 响应副作用 —— Toast 收到新消息时自动入列并调度 3 秒消失
- `ToastService` 由 `BehaviorSubject` 改为 `signal`，组件直接读取，无需 subscribe/退订
- dismiss 时回写 `ToastService.remove(id)` 从源头清理，修复 `scheduled` 集合与消息列表的内存增长

> 仍保留 zone.js 驱动变更检测；`newUser`/`editingUser` 等表单状态因 `[(ngModel)]` 双向绑定仍用普通对象。

### API 切换机制

前端会自动在两个 API 源之间切换：

1. **本地 API**: `http://localhost:3000/users`（带 SQLite 的 NestJS 后端）
2. **备用 API**: `https://jsonplaceholder.typicode.com/users`（公共 API）

#### 工作原理

- **SSE 连接**: 后端启动时与前端建立 SSE 连接
- **心跳机制**: 后端每 30 秒发送心跳消息保持连接活跃
- **自动切换**: 前端收到后端启动通知后切换到本地 API
- **备用机制**: 如果后端不可用，前端使用备用 API
- **定期检查**: 如果 SSE 不支持或连接失败，前端每 60 秒检查一次后端状态

### 浏览器兼容性

EventSource (SSE) 浏览器支持情况：

| 浏览器 | 支持版本 |
|--------|---------|
| Chrome | 6+ ✅ |
| Firefox | 6+ ✅ |
| Safari | 5.1+ ✅ |
| Edge | 79+ ✅ |
| Opera | 11.6+ ✅ |
| iOS Safari | 4.2+ ✅ |
| **Internet Explorer** | **全系列不支持** ❌ |

## 数据库

后端使用 SQLite 进行数据持久化：

- 数据库文件: `backend/database.sqlite`
- TypeORM 用于数据库操作
- 开发环境自动同步表结构

## API 端点

### 用户 API

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/users` | 获取所有用户 |
| GET | `/users/:id` | 根据 ID 获取用户 |
| POST | `/users` | 创建新用户 |
| PATCH | `/users/:id` | 更新用户 |
| DELETE | `/users/:id` | 删除用户 |

### 事件 API

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/events/stream` | SSE 事件流，用于实时通知 |

## 代码脚手架

### 前端（Angular）

```bash
ng generate component component-name
ng generate service service-name
ng generate directive directive-name
```

### 后端（NestJS）

```bash
cd backend
nest generate module module-name
nest generate controller controller-name
nest generate service service-name
nest generate resource resource-name
```

## 构建

### 前端
```bash
npm run build
# 输出目录: dist/user-management/
```

### 后端
```bash
cd backend
npm run build
# 输出目录: dist/
```

## 测试

### 前端
```bash
npm test
```

### 后端
```bash
cd backend
npm run test
npm run test:e2e
```

## 更多资源

- [Angular CLI 概述](https://angular.dev/tools/cli)
- [Angular Signals 文档](https://angular.dev/guide/signals)
- [NestJS 文档](https://docs.nestjs.com/)
- [TypeORM 文档](https://typeorm.io/)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events)

---

# UserManagement

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) and upgraded to Angular 22 with Signals.

## Project Structure

```
angular-learning/
├── src/                          # Angular frontend
│   ├── app/
│   │   ├── toast/               # Toast notification component
│   │   ├── services/            # User service
│   │   ├── user-list/           # User list component
│   │   └── user-detail/         # User detail component
├── backend/                      # NestJS backend
│   ├── src/
│   │   ├── users/               # User-related modules
│   │   └── events/             # SSE event controller
├── database.sqlite              # SQLite database
└── README.md
```

## Technology Stack

- **Frontend**: Angular 22, TypeScript 6.0, RxJS, Angular Router, Signals
- **Backend**: NestJS 11, TypeORM, SQLite
- **API**: RESTful API + Server-Sent Events (SSE)
- **Build**: @angular/build (esbuild/Vite, migrated from webpack-based @angular-devkit/build-angular)

## Quick Start

### 1. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend && npm install
```

### 2. Start Servers

**Terminal 1 - Frontend (Angular)**:
```bash
npm start
# Access: http://localhost:4200
```

**Terminal 2 - Backend (NestJS)**:
```bash
cd backend
npm run start:dev
# Access: http://localhost:3000
```

## Features

### User Management
- View user list with search and filter
- Create, edit, and delete users
- View user details

### Toast Notifications
- Success, error, warning, and info message types
- Auto-dismiss after 3 seconds
- Manual dismiss available

### Loading States
- Spinner animation during data loading
- User-friendly loading indicators

### Signal Reactive Refactor

The frontend has migrated from the traditional RxJS subscription model to Angular's Signal reactivity:

- `signal()` holds writable state (e.g. `users`, `isLoading`, `user`)
- `computed()` derived state — `filteredUsers` auto-tracks `users`/`searchTerm`/sort & filter, no manual `applyFilters()` calls
- `input()` signal inputs replace `@Input()` (ToastComponent)
- `effect()` side effects — toast auto-enqueues and schedules 3s dismiss on new messages
- `ToastService` switched from `BehaviorSubject` to `signal`; components read directly, no subscribe/unsubscribe
- On dismiss, `ToastService.remove(id)` prunes the source, fixing `scheduled` set and message-list memory growth

> zone.js change detection is retained; form state like `newUser`/`editingUser` still uses plain objects for `[(ngModel)]` two-way binding.

### API Switching Mechanism

The frontend automatically switches between two API sources:

1. **Local API**: `http://localhost:3000/users` (NestJS backend with SQLite)
2. **Fallback API**: `https://jsonplaceholder.typicode.com/users` (public API)

#### How It Works

- **SSE Connection**: When backend starts, it establishes an SSE connection with the frontend
- **Heartbeat**: Backend sends heartbeat messages every 30 seconds to keep the connection alive
- **Automatic Switching**: Frontend switches to local API upon receiving SSE notification
- **Fallback**: If backend is unavailable, frontend uses the fallback API
- **Polling**: If SSE is not supported or connection fails, frontend checks backend status every 60 seconds

### Browser Compatibility

EventSource (SSE) browser support:

| Browser | Support |
|---------|---------|
| Chrome | 6+ ✅ |
| Firefox | 6+ ✅ |
| Safari | 5.1+ ✅ |
| Edge | 79+ ✅ |
| Opera | 11.6+ ✅ |
| iOS Safari | 4.2+ ✅ |
| **Internet Explorer** | **Not supported** ❌ |

## Database

The backend uses SQLite for data persistence:

- Database file: `backend/database.sqlite`
- TypeORM for database operations
- Automatic schema synchronization (`synchronize: true` for development)

## API Endpoints

### User API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create new user |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

### Events API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events/stream` | SSE event stream for real-time notifications |

## Code Scaffolding

### Frontend (Angular)

```bash
ng generate component component-name
ng generate service service-name
ng generate directive directive-name
```

### Backend (NestJS)

```bash
cd backend
nest generate module module-name
nest generate controller controller-name
nest generate service service-name
nest generate resource resource-name
```

## Building

### Frontend
```bash
npm run build
# Output: dist/user-management/
```

### Backend
```bash
cd backend
npm run build
# Output: dist/
```

## Testing

### Frontend
```bash
npm test
```

### Backend
```bash
cd backend
npm run test
npm run test:e2e
```

## Additional Resources

- [Angular CLI Overview](https://angular.dev/tools/cli)
- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
