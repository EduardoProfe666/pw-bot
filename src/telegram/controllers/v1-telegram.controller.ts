import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Telegraf, Context } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import StudentOutDto from '../../students/dto/out/student.out.dto';

@Controller('v1/webhook')
@ApiTags('webhook')
@UseInterceptors(CacheInterceptor)
export default class V1TelegramController {
  constructor(
    private readonly bot: Telegraf<Context>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Post('')
  @ApiOperation({summary: 'Webhook connection'})
  async handleWebhook(@Body() update: any) {
    await this.bot.handleUpdate(update);
  }

  @Post('set')
  @ApiOkResponse({description: "Ok"})
  @ApiOperation({summary: 'Init webhook'})
  async setWebhook() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const domain = this.configService.get<string>('APP_DOMAIN');

    const url = `https://api.telegram.org/bot${token}/setWebhook?url=${domain}/v1/webhook`;

    try {
      const response = await lastValueFrom(this.httpService.post(url, null));
      return response.data;
    } catch (error) {
      throw new Error(`Error setting webhook: ${error.message}`);
    }
  }
}
