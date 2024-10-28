import { Module } from '@nestjs/common';
import DatabaseModule from '../database/database.module';
import StudentsService from './services/students.service';
import V1StudentsController from './controllers/v1-students.controller';
import UsersModule from '../users/users.module';
import AuthModule from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    DatabaseModule
  ],
  controllers: [V1StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export default class StudentsModule {}
