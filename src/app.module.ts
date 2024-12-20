import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import AssessmentsModule from './assessments/assessments.module';
import DatabaseModule from './database/database.module';
import GradesModule from './grades/grades.module';
import StudentsModule from './students/students.module';
import TelegramModule from './telegram/telegram.module';
import AuthModule from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import UsersModule from './users/users.module';
import InfrastructureModule from './infrastructure/infrastructure.module';
import ReportsModule from './reports/reports.module';
import MailModule from './mail/mail.module';
import { configSchema } from './utils/config.schema';
import DataModule from './data/data.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: configSchema,
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      max: 60,
      ttl: 60
    }),
    // ThrottlerModule.forRoot([{
    //   ttl: 60,
    //   limit: 100,
    // }]),
    AssessmentsModule,
    AuthModule,
    DataModule,
    DatabaseModule,
    GradesModule,
    InfrastructureModule,
    MailModule,
    ReportsModule,
    StudentsModule,
    TelegramModule,
    UsersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
