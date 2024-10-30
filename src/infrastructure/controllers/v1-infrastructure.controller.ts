import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('v1/infrastructure')
@ApiTags('infrastructure')
export default class V1InfrastructureController{
  @Get('/wake-up')
  @ApiOperation({ summary: 'Wake me up' })
  async wakeUp(){
    return {message: 'Im awake'};
  }
}