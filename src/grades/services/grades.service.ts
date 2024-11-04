import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import GradeOutDto from '../dto/out/grade.out.dto';
import Grade from '../../database/entities/grade.entity';
import GradeWithAssessmentOutDto from '../dto/out/grade-with-assessment.out.dto';
import GradeInDto from '../dto/in/grade.in.dto';
import MailService from '../../mail/services/mail.service';
import RankingTableOutDto from '../../reports/dto/out/ranking-table.out.dto';
import ReportsService from '../../reports/services/reports.service';

@Injectable()
export default class GradesService {
  private readonly logger = new Logger(GradesService.name);

  constructor(
    private readonly pgService: PgService,
    private readonly mailService: MailService,
    private readonly reportService: ReportsService,
  ) {}

  public async getAll(): Promise<GradeOutDto[]> {
    const grades = await this.pgService.grades.find({
      relations: ['student', 'assessment'],
    });
    return grades.map((g) => this.toOutDto(g));
  }

  public async getById(id: number): Promise<GradeWithAssessmentOutDto> {
    const grade = await this.pgService.grades.findOne({
      where: { id },
      relations: ['student', 'assessment'],
    });
    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
    return this.toOutDtoWithAssessment(grade);
  }

  public async getByStudentId(
    id: number,
  ): Promise<GradeWithAssessmentOutDto[]> {
    const st = await this.pgService.students.findOne({ where: { id } });

    if (!st) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    const grades = await this.pgService.grades.find({
      where: { student: st },
      relations: ['student', 'assessment'],
    });

    return !grades || grades.length === 0
      ? []
      : grades.map((x) => this.toOutDtoWithAssessment(x));
  }

  public async missingGradeAssessmentsByUsername(
    username: string,
  ): Promise<string[]> {
    const st = await this.pgService.users.findOne({
      where: { username },
      relations: ['student'],
    });

    if (!st) {
      throw new NotFoundException(
        `Student with Username ${username} not found`,
      );
    }

    const grades = await this.pgService.grades.find({
      where: { student: st.student },
      relations: ['assessment'],
    });

    const assessments = await this.pgService.assessments.find({
      where: { onGoing: true },
      order: { id: 'ASC' },
    });

    return assessments
      .filter((x) => !grades.some((y) => y.assessment.id === x.id))
      .map((x) => x.name);
  }

  public async getAvgByStudentId(id: number): Promise<number> {
    const st = await this.pgService.students.findOne({ where: { id } });

    if (!st) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    const grades = await this.pgService.grades.find({
      where: { student: st },
      relations: ['student', 'assessment'],
    });
    let totalGrades = 0;
    let countGrades = 0;

    grades.forEach((x) => {
      if (x.grade) {
        totalGrades += x.grade;
        countGrades++;
      }
    });

    return countGrades > 0
      ? parseFloat((totalGrades / countGrades).toFixed(2))
      : 0;
  }

  public async getCountByStudentId(id: number): Promise<number> {
    const student = await this.pgService.students.findOne({
      where: { id },
      relations: ['grades'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student.grades?.length ?? 0;
  }

  public async getAvgByStudentUsername(username: string): Promise<number> {
    const user = await this.pgService.users.findOne({
      where: { username },
      relations: ['student'],
    });

    if (!user) {
      throw new NotFoundException(
        `Student with Username ${username} not found`,
      );
    }

    return this.getAvgByStudentId(user.student.id);
  }

  public async getByStudentUsername(
    username: string,
  ): Promise<GradeWithAssessmentOutDto[]> {
    const user = await this.pgService.users.findOne({
      where: { username },
      relations: ['student'],
    });

    if (!user) {
      throw new NotFoundException(
        `Student with username ${username} not found`,
      );
    }

    const grades = await this.pgService.grades.find({
      where: { student: user.student },
      relations: ['student', 'assessment'],
    });

    return !grades || grades.length === 0
      ? []
      : grades.map((x) => this.toOutDtoWithAssessment(x));
  }

  public async put(id: number, dto: GradeInDto): Promise<void> {
    const grade = await this.pgService.grades.findOne({
      where: { id },
    });
    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }

    const student = await this.pgService.students.findOne({
      where: { id: dto.studentId },
      relations: ['user'],
    });

    if (!student) {
      throw new BadRequestException(
        `Student with ID ${dto.studentId} not found`,
      );
    }

    const assessment = await this.pgService.assessments.findOne({
      where: { id: dto.assessmentId },
    });

    if (!assessment) {
      throw new BadRequestException(
        `Student with ID ${dto.assessmentId} not found`,
      );
    }

    const g = await this.pgService.grades.findOne({
      where: { student: student, assessment: assessment },
    });

    if (g && g.id !== id) {
      throw new ConflictException(
        `Grade of student "${student.user.username}" in assessment "${assessment.name}" already exists`,
      );
    }

    grade.grade = dto.grade;
    grade.professorNote = dto.professorNote;
    grade.student = student;
    grade.assessment = assessment;

    await this.pgService.grades.save(grade);
    this.logger.log(`Updated grade with ID ${id}`);
    this.logger.log({ ...dto });
  }

  public async post(dto: GradeInDto): Promise<GradeWithAssessmentOutDto> {
    const student = await this.pgService.students.findOne({
      where: { id: dto.studentId },
      relations: ['user'],
    });

    if (!student) {
      throw new BadRequestException(
        `Student with ID ${dto.studentId} not found`,
      );
    }

    const assessment = await this.pgService.assessments.findOne({
      where: { id: dto.assessmentId },
    });

    if (!assessment) {
      throw new BadRequestException(
        `Student with ID ${dto.assessmentId} not found`,
      );
    }

    const existingGrade = await this.pgService.grades.findOne({
      where: { student: student, assessment: assessment },
    });
    if (existingGrade) {
      throw new ConflictException(
        `Grade of student "${student.user.username}" in assessment "${assessment.name}" already exists`,
      );
    }

    const newGrade = this.pgService.grades.create({
      grade: dto.grade,
      professorNote: dto.professorNote,
      student,
      assessment,
    });

    await this.pgService.grades.save(newGrade);

    this.logger.log(`Created new grade with ID ${newGrade.id}`);
    this.logger.log({ ...dto });

    await this.mailService.sendGradeNotificationEmail(
      student.user.email,
      student.name,
      assessment.name,
      dto.grade,
      dto.professorNote,
    );

    this.checkForRankingTableUpdates(await this.reportService.getRankingTable());

    return this.toOutDtoWithAssessment(newGrade);
  }

  private async checkForRankingTableUpdates(previousRankingTable: RankingTableOutDto){
    const currentRankingTable = await this.reportService.getRankingTable();


  }

  public async delete(id: number): Promise<void> {
    const result = await this.pgService.grades.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }

    this.logger.log(`Deleted Grade with ID ${id}`);
  }

  private toOutDto(grade: Grade): GradeOutDto {
    return {
      id: grade.id,
      grade: grade.grade,
      professorNote: grade.professorNote,
      studentId: grade.student.id,
      assessmentId: grade.assessment.id,
    };
  }

  private toOutDtoWithAssessment(grade: Grade): GradeWithAssessmentOutDto {
    return {
      id: grade.id,
      grade: grade.grade,
      assessment: grade.assessment,
      studentId: grade.student.id,
      professorNote: grade.professorNote,
    };
  }
}
