import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('v1/infrastructure')
@ApiTags('infrastructure')
export default class V1InfrastructureController{
  @Get('/wake-up')
  @ApiOperation({ summary: 'Wake up me' })
  async wakeUp(){
    return {message: 'I am awake'};
  }
}