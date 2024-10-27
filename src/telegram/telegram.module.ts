import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import GradesModule from '../grades/grades.module';
import StudentsModule from '../students/students.module';
import AssessmentsModule from '../assessments/assessments.module';
import TelegramService from './services/telegram.service';
import V1TelegramController from './controllers/v1-telegram.controller';
import { HttpModule } from '@nestjs/axios';
import { Telegraf } from 'telegraf';

@Module({
  imports: [
    ConfigModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        token: config.get<string>('TELEGRAM_TOKEN'),
        webhook: {
          domain: config.get<string>('APP_DOMAIN'),
          port: config.get<number>('APP_PORT'),
          hookPath: '/v1/webhook'
        },
      }),
      inject: [ConfigService],
    }),
    GradesModule,
    StudentsModule,
    AssessmentsModule,
    HttpModule
  ],
  controllers: [V1TelegramController],
  providers: [TelegramService, Telegraf],
})
export default class TelegramModule {}
