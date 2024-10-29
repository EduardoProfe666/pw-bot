import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import GradesModule from '../grades/grades.module';
import StudentsModule from '../students/students.module';
import AssessmentsModule from '../assessments/assessments.module';
import TelegramService from './services/telegram.service';
import { HttpModule } from '@nestjs/axios';
import DatabaseModule from '../database/database.module';


@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        token: config.get<string>('TELEGRAM_TOKEN'),
      }),
      inject: [ConfigService],
    }),
    GradesModule,
    StudentsModule,
    AssessmentsModule,
    HttpModule
  ],
  controllers: [],
  providers: [TelegramService],
})
export default class TelegramModule {}
