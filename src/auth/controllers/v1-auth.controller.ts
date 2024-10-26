import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { AuthService } from '../services/auth.service';
import AuthInDto from '../dto/in/auth.in.dto';
import AuthOutDto from '../dto/out/auth.out.dto';
import AssessmentOutDto from '../../assessments/dto/out/assessment.out.dto';

@Controller('v1/auth')
@ApiTags('auth')
@UseInterceptors(CacheInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({type: AuthOutDto})
  @ApiOperation({summary: 'Authenticate into System'})
  async login(@Body() body: AuthInDto): Promise<AuthOutDto> {
    const token = await this.authService.login(body.username, body.password);
    return {
      token: token,
    };
  }
}
