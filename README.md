# UserManagement

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.24.

## Project Structure

```
angular-learning/
├── src/              # Angular frontend
├── backend/          # NestJS backend
│   ├── src/
│   │   ├── users/    # User-related modules
│   │   └── gateway/  # WebSocket gateway
├── database.sqlite   # SQLite database
└── README.md
```

## Technology Stack

- **Frontend**: Angular 19, TypeScript, RxJS
- **Backend**: NestJS, TypeORM, SQLite
- **API**: RESTful API + WebSocket

## Development Server

### Frontend

To start the Angular development server, run:

```bash
ng serve
```

Open your browser and navigate to `http://localhost:4200/` (or the port shown in the terminal). The application will automatically reload when you modify any source files.

### Backend

To start the NestJS development server, run:

```bash
cd backend
npm run start:dev
```

The backend server will run on `http://localhost:3000/`.

## API Switching Mechanism

The frontend automatically switches between two API sources:

1. **Local API**: `http://localhost:3000/users` (NestJS backend with SQLite)
2. **Fallback API**: `https://jsonplaceholder.typicode.com/users` (public API)

### How It Works

- **WebSocket Notification**: When the backend starts, it sends a WebSocket notification to the frontend
- **Automatic Switching**: The frontend switches to the local API when it receives the notification
- **Fallback Mechanism**: If the backend is not available, the frontend uses the fallback API
- **Periodic Check**: If WebSocket fails, the frontend checks the backend status every 30 seconds

## Database

The backend uses SQLite for data persistence:

- Database file: `backend/database.sqlite`
- TypeORM for database operations
- Automatic schema synchronization

## Code Scaffolding

### Frontend (Angular)

To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics, run:

```bash
ng generate --help
```

### Backend (NestJS)

To generate a new module, run:

```bash
cd backend
nest generate module module-name
```

## Building

### Frontend

To build the Angular project, run:

```bash
ng build
```

Build artifacts will be stored in the `dist/` directory.

### Backend

To build the NestJS project, run:

```bash
cd backend
npm run build
```

## Testing

### Frontend

To run unit tests:

```bash
ng test
```

### Backend

To run backend tests:

```bash
cd backend
npm run test
```

## API Endpoints

### User API

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Additional Resources

- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)

---

# 用户管理

本项目基于 [Angular CLI](https://github.com/angular/angular-cli) 19.2.24 版本生成。

## 项目结构

```
angular-learning/
├── src/              # Angular 前端
├── backend/          # NestJS 后端
│   ├── src/
│   │   ├── users/    # 用户相关模块
│   │   └── gateway/  # WebSocket 网关
├── database.sqlite   # SQLite 数据库
└── README.md
```

## 技术栈

- **前端**: Angular 19, TypeScript, RxJS
- **后端**: NestJS, TypeORM, SQLite
- **API**: RESTful API + WebSocket

## 开发服务器

### 前端

启动 Angular 开发服务器，请运行：

```bash
ng serve
```

打开浏览器并访问 `http://localhost:4200/`（或终端中显示的端口）。当你修改源代码时，应用会自动重新加载。

### 后端

启动 NestJS 开发服务器，请运行：

```bash
cd backend
npm run start:dev
```

后端服务器将在 `http://localhost:3000/` 上运行。

## API 切换机制

前端会自动在两个 API 源之间切换：

1. **本地 API**: `http://localhost:3000/users`（带 SQLite 的 NestJS 后端）
2. **备用 API**: `https://jsonplaceholder.typicode.com/users`（公共 API）

### 工作原理

- **WebSocket 通知**: 后端启动时，通过 WebSocket 向前端发送通知
- **自动切换**: 前端收到通知后切换到本地 API
- **备用机制**: 如果后端不可用，前端使用备用 API
- **定期检查**: 如果 WebSocket 失败，前端每 30 秒检查一次后端状态

## 数据库

后端使用 SQLite 进行数据持久化：

- 数据库文件: `backend/database.sqlite`
- TypeORM 用于数据库操作
- 自动同步表结构

## 代码脚手架

### 前端（Angular）

生成新组件，请运行：

```bash
ng generate component component-name
```

获取所有可用生成器的完整列表，请运行：

```bash
ng generate --help
```

### 后端（NestJS）

生成新模块，请运行：

```bash
cd backend
nest generate module module-name
```

## 构建

### 前端

构建 Angular 项目，请运行：

```bash
ng build
```

构建产物将存储在 `dist/` 目录中。

### 后端

构建 NestJS 项目，请运行：

```bash
cd backend
npm run build
```

## 测试

### 前端

运行单元测试：

```bash
ng test
```

### 后端

运行后端测试：

```bash
cd backend
npm run test
```

## API 端点

### 用户 API

- `GET /users` - 获取所有用户
- `GET /users/:id` - 根据 ID 获取用户
- `POST /users` - 创建新用户
- `PATCH /users/:id` - 更新用户
- `DELETE /users/:id` - 删除用户

## 更多资源

- [Angular CLI 概述与命令参考](https://angular.dev/tools/cli)
- [NestJS 文档](https://docs.nestjs.com/)
- [TypeORM 文档](https://typeorm.io/)
