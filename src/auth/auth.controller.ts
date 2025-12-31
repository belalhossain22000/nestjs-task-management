import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResponseMessage } from 'src/common/interceptors/response.interceptor';
import { CurrentUser } from './decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // login
  @ResponseMessage('User logged in successfully')
  @Post('/login')
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

  // logout
  @Post('/logout')
  @ResponseMessage('User logged out successfully')
  logout() {}
}
