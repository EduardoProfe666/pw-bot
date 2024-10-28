import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import V1GradesController from './controllers/v1-grades.controller';
import GradesService from './services/grades.service';
import DatabaseModule from '../database/database.module';
import AuthModule from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    DatabaseModule
  ],
  controllers: [V1GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export default class GradesModule {}
