import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** 局部更新用户时，所有字段均可选；字段一旦传入就不能为空字符串。 */
export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  username?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email?: string;
}
