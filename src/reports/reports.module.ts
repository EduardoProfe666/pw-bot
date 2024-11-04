import { forwardRef, Module } from '@nestjs/common';
import DatabaseModule from '../database/database.module';
import UsersModule from '../users/users.module';
import AuthModule from '../auth/auth.module';
import V1ReportsController from './controllers/v1-reports.controller';
import ReportsService from './services/reports.service';
import StudentsModule from '../students/students.module';
import GradesModule from '../grades/grades.module';
import AssessmentsModule from '../assessments/assessments.module';
import MailModule from '../mail/mail.module';
import InfrastructureModule from '../infrastructure/infrastructure.module';

@Module({
  imports: [
    AuthModule,
    AssessmentsModule,
    StudentsModule,
    forwardRef(() => GradesModule),
    MailModule,
    DatabaseModule
  ],
  controllers: [V1ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export default class ReportsModule {}
