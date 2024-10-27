import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import GradesModule from '../grades/grades.module';
import StudentsModule from '../students/students.module';
import AssessmentsModule from '../assessments/assessments.module';
import TelegramService from './services/telegram.service';

@Module({
  imports: [
    ConfigModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        token: config.get<string>('TELEGRAM_TOKEN'),
      }),
      inject: [ConfigService],
    }),
    GradesModule,
    StudentsModule,
    AssessmentsModule
  ],
  controllers: [],
  providers: [TelegramService],
})
export default class TelegramModule {}
