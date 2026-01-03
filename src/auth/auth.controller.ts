import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResponseMessage } from 'src/common/interceptors/response.interceptor';
import { CurrentUser } from './decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Roles } from './decorators/roles.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // login
  @Public()
  @Post('/login')
  @ResponseMessage('User logged in successfully')
  create(@Body() login: LoginDto) {
    return this.authService.login(login);
  }

  // change password
  @Roles('ADMIN')
  @Post('/change-password')
  @ResponseMessage('Password changed successfully')
  changePassword(
    @CurrentUser() user: { sub: string },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.sub, dto.newPassword);
  }

  
  // forgot password
  @Public()
  @Post('/forgot-password')
  @ResponseMessage('If the email exists, a reset link has been sent')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  // reset password
  @Public()
  @Post('/reset-password')
  @ResponseMessage('Password reset successfully')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
