import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * 创建用户的 DTO（数据传输对象）
 * 用于验证和传输创建用户时的数据
 */
export class CreateUserDto {
  /**
   * 用户真实姓名
   * @IsNotEmpty() 确保字段不为空
   * @IsString() 确保字段为字符串类型
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * 用户名（登录用）
   * @IsNotEmpty() 确保字段不为空
   * @IsString() 确保字段为字符串类型
   */
  @IsNotEmpty()
  @IsString()
  username: string;

  /**
   * 电子邮件
   * @IsNotEmpty() 确保字段不为空
   * @IsEmail() 确保字段为有效的电子邮件格式
   */
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
