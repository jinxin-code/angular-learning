/**
 * 前端运行配置。
 * 当前项目只在本地开发环境运行；如需区分生产环境，可在 angular.json 中配置文件替换。
 */
export const environment = {
  production: false,
  localApiBaseUrl: 'http://localhost:3000',
  fallbackUsersApiUrl: 'https://jsonplaceholder.typicode.com/users',
  healthCheckIntervalMs: 60_000,
};
