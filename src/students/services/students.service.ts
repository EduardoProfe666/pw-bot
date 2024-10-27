import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import Student from '../../database/entities/student.entity';
import StudentOutDto from '../dto/out/student.out.dto';
import StudentWithGradesOutDto from '../dto/out/student-with-grades.out.dto';
import StudentInDto from '../dto/in/student.in.dto';

@Injectable()
export default class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(private readonly pgService: PgService) {}

  public async getAll(): Promise<StudentOutDto[]> {
    const students = await this.pgService.students.find();
    return students.map((st) => this.toOutDto(st));
  }

  public async getById(id: number): Promise<StudentOutDto> {
    const student = await this.pgService.students.findOne({
      where: { id },
      relations: ['grades'],
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return this.toOutDto(student);
  }

  public async getByUsername(username: string): Promise<StudentOutDto> {
    const student = await this.pgService.students.findOne({
      where: { username },
    });
    if (!student) {
      throw new NotFoundException(`Student with username @${username} not found`);
    }
    return this.toOutDto(student);
  }

  public async put(id: number, dto: StudentInDto): Promise<void> {
    const student = await this.pgService.students.findOne({
      where: { id },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    const s = await this.pgService.students.findOne({
      where: { username: dto.username },
    });
    if (s && s.id !== id) {
      throw new ConflictException(
        `Student with username "${dto.username}" already exists`,
      );
    }

    await this.pgService.students.update(id, dto);
    this.logger.log(`Updated student with ID ${id}`);
    this.logger.log({ ...dto });
  }

  public async post(dto: StudentInDto): Promise<StudentOutDto> {
    const existingStudent = await this.pgService.students.findOne({
      where: { username: dto.username },
    });
    if (existingStudent) {
      throw new ConflictException(
        `Student with username "${dto.username}" already exists`,
      );
    }

    const newStudent = this.pgService.students.create(dto);
    await this.pgService.students.save(newStudent);

    this.logger.log(`Created new student with ID ${newStudent.id}`);
    this.logger.log({ ...dto });
    return this.toOutDto(newStudent);
  }

  public async delete(id: number): Promise<void> {
    const result = await this.pgService.students.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    this.logger.log(`Deleted student with ID ${id}`);
  }

  private toOutDto(student: Student): StudentOutDto {
    return {
      id: student.id,
      name: student.name,
      username: student.username,
      fullname: student.fullName
    };
  }

  private toOutWithGradesDto(student: Student): StudentWithGradesOutDto{
    return {
      id: student.id,
      name: student.name,
      username: student.username,
      fullname: student.fullName,
      grades: student.grades?.map(x => ({
        id: x.id,
        grade: x.grade,
        studentId: x.student.id,
        assessment: x.assessment,
        professorNote: x.professorNote
      })) ?? []
    }
  }
}
