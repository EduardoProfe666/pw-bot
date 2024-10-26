import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import AssessmentsModule from './assessments/assessments.module';
import DatabaseModule from './database/database.module';
import GradesModule from './grades/grades.module';
import StudentsModule from './students/students.module';
import TelegramModule from './telegram/telegram.module';
import AuthModule from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      max: 60,
      ttl: 60
    }),
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 500,
    }]),
    AssessmentsModule,
    AuthModule,
    DatabaseModule,
    GradesModule,
    StudentsModule,
    TelegramModule,

  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
