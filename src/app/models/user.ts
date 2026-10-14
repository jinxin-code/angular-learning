/** 用户数据。备用 API 会返回可选的电话、网站、地址和公司字段。 */
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  website?: string;
  address?: Address;
  company?: Company;
}

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo?: Geo;
}

export interface Geo {
  lat: string;
  lng: string;
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}
