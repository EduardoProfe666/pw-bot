import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import GradesModule from '../grades/grades.module';
import StudentsModule from '../students/students.module';
import AssessmentsModule from '../assessments/assessments.module';
import TelegramService from './services/telegram.service';
import { HttpModule } from '@nestjs/axios';
import DatabaseModule from '../database/database.module';
import AuthModule from '../auth/auth.module';
import UsersModule from '../users/users.module';
import ReportsModule from '../reports/reports.module';
import DataModule from '../data/data.module';
import TelegramUtilsService from './services/telegram-utils.service';


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
    AuthModule,
    UsersModule,
    DataModule,
    forwardRef(() => ReportsModule),
    forwardRef(() => GradesModule),
    forwardRef(() => StudentsModule),
    AssessmentsModule,
    HttpModule
  ],
  controllers: [],
  providers: [TelegramService, TelegramUtilsService],
  exports: [TelegramUtilsService]
})
export default class TelegramModule {}
