/**
 * User - 用户模型接口
 *
 * ===== TypeScript 接口 (Interface) =====
 *
 * 接口用于定义对象的结构类型
 * 主要用途：
 * 1. 类型检查 - 编译时检查对象结构
 * 2. 代码文档 - 明确数据结构
 * 3. 智能提示 - IDE 提供自动补全
 *
 * ===== TypeScript 可选属性 =====
 *
 * 使用 ? 标记的属性是可选的
 * 可选属性可以不存在或为 undefined
 */
export interface User {
  /** 用户唯一标识符 */
  id: number;
  /** 用户姓名 */
  name: string;
  /** 用户名（登录用） */
  username: string;
  /** 邮箱地址 */
  email: string;
  /** 电话号码（可选） */
  phone?: string;
  /** 网站（可选） */
  website?: string;

  /** 地址信息（可选，嵌套对象） */
  address?: Address;
  /** 公司信息（可选，嵌套对象） */
  company?: Company;
}

/**
 * Address - 地址嵌套接口
 *
 * 【嵌套对象类型】
 * 接口可以包含其他接口类型的属性
 * 形成嵌套的对象结构
 */
export interface Address {
  /** 街道地址 */
  street: string;
  /** 套房/单元号 */
  suite: string;
  /** 城市 */
  city: string;
  /** 邮编 */
  zipcode: string;
  /** 地理坐标（可选，嵌套对象） */
  geo?: Geo;
}

/**
 * Geo - 地理坐标接口
 */
export interface Geo {
  /** 纬度 */
  lat: string;
  /** 经度 */
  lng: string;
}

/**
 * Company - 公司信息接口
 */
export interface Company {
  /** 公司名称 */
  name: string;
  /** 公司标语 */
  catchPhrase: string;
  /** 公司业务描述 */
  bs: string;
}
