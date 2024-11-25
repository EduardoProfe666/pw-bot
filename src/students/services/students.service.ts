import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import Student from '../../database/entities/student.entity';
import StudentOutDto from '../dto/out/student.out.dto';
import StudentInDto from '../dto/in/student.in.dto';
import TelegramUtilsService from '../../telegram/services/telegram-utils.service';

@Injectable()
export default class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    private readonly pgService: PgService,
    @Inject(forwardRef(() => TelegramUtilsService))
    private readonly telegramUtilsService: TelegramUtilsService,
  ) {}

  public async getAll(): Promise<StudentOutDto[]> {
    const students = await this.pgService.students.find({
      relations: ['user'],
    });
    return Promise.all(students.map(async (st) => await this.toOutDto(st)));
  }

  public async getById(id: number): Promise<StudentOutDto> {
    const student = await this.pgService.students.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return this.toOutDto(student);
  }

  public async getByUsername(username: string): Promise<StudentOutDto> {
    const students = await this.pgService.students.find({
      relations: ['user'],
    });

    const student = students.find(
      (x) => x.user && x.user.username === username,
    );

    if (!student) {
      throw new NotFoundException(
        `Student with username @${username} not found`,
      );
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

    await this.pgService.students.update(id, dto);
    this.logger.log(`Updated student with ID ${id}`);
    this.logger.log({ ...dto });
  }

  public async delete(id: number): Promise<void> {
    const result = await this.pgService.students.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    this.logger.log(`Deleted student with ID ${id}`);
  }

  private async toOutDto(student: Student): Promise<StudentOutDto> {
    const username = student.user?.username ?? '';

    const userIdTelegram = student.user?.userIdTelegram ?? null; // Obtén el userIdTelegram
    const avatar = await this.telegramUtilsService.getProfilePhotoUrl(userIdTelegram);
    
    //const avatar = await this.telegramUtilsService.getProfilePhotoUrl();
    return {
      id: student.id,
      name: student.name,
      username: student.user?.username ?? '',
      fullName: student.fullName,
      userId: student.user?.id ?? 0,
      isRecognized: student.isRecognized,
      listNumber: student.listNumber,
      isCarryForward: student.isCarryForward,
      isRepeater: student.isRepeater,
      avatar: avatar,
    };
  }
}
