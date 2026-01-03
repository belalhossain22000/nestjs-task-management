import { IsEmail, IsString, MinLength, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(4, 4, { message: 'OTP must be exactly 4 digits' })
  otp: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
