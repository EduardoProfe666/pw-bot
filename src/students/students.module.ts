import { Module } from '@nestjs/common';
import DatabaseModule from '../database/database.module';
import StudentsService from './services/students.service';
import V1StudentsController from './controllers/v1-students.controller';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [V1StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export default class StudentsModule {}
