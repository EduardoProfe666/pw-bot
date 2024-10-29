import { Body, Controller, Post, UseGuards, UseInterceptors, Request } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth, ApiCreatedResponse,
  ApiForbiddenResponse, ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { AuthService } from '../services/auth.service';
import LoginInDto from '../dto/in/login.in.dto';
import AuthOutDto from '../dto/out/auth.out.dto';
import ChangePasswordInDto from '../dto/in/change-password.in.dto';
import ForgotPasswordInDto from '../dto/in/forgot-password.in.dto';
import ResetPasswordInDto from '../dto/in/reset-password.in.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('v1/auth')
@ApiTags('auth')
@UseInterceptors(CacheInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiCreatedResponse({description: "Ok",type: AuthOutDto})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Authenticate into System'})
  async login(@Body() body: LoginInDto): Promise<AuthOutDto> {
    const token = await this.authService.login(body.username, body.password);
    return {
      token: token,
    };
  }

  @Post('change-password')
  @Roles('student')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({description: "Unauthorized"})
  @ApiForbiddenResponse({description: "Forbidden"})
  @ApiOkResponse({description: "Ok"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Change an students password'})
  async changePassword(@Body() dto: ChangePasswordInDto, @Request() req) {
    const username = req.user.username;
    return this.authService.changePassword(username, dto.oldPassword, dto.newPassword);
  }

  @Post('forgot-password')
  @ApiOkResponse({description: "Ok"})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Sends an email to student to reset his password'})
  async forgotPassword(@Body() dto: ForgotPasswordInDto){
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOkResponse({description: "Ok"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Complete reset password process'})
  async resetPassword(@Body() dto: ResetPasswordInDto){
    return this.authService.resetPassword(dto.resetToken, dto.newPassword);
  }
}
