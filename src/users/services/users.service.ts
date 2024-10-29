import { ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import UserOutDto from '../dto/out/user.out.dto';
import User from '../../database/entities/user.entity';
import UserWithStudentOutDto from '../dto/out/user-with-student.out.dto';
import UserInDto from '../dto/in/user.in.dto';
import UserUpdateInDto from '../dto/in/user-update.in.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export default class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly pgService: PgService) {}

  public async getAll(): Promise<UserOutDto[]> {
    const users = await this.pgService.users.find({
      order: {
        id: 'ASC'
      },
      relations: ['student']
    });
    return users.map((users) => this.toOutDto(users));
  }

  public async getById(id: number): Promise<UserWithStudentOutDto> {
    const user = await this.pgService.users.findOne({
      where: { id },
      relations: ['student']
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.toOutDtoWithStudent(user);
  }

  public async getByUsername(username: string): Promise<UserWithStudentOutDto> {
    const user = await this.pgService.users.findOne({
      where: { username },
      relations: ['student']
    });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return this.toOutDtoWithStudent(user);
  }

  public async post(dto: UserInDto): Promise<UserOutDto> {
    const existingUser = await this.pgService.users.findOne({
      where: { username: dto.username },
    });
    if (existingUser) {
      throw new ConflictException(
        `User with username "${dto.name}" already exists`,
      );
    }

    const newStudent = this.pgService.students.create({
      fullName: dto.fullName,
      name: dto.name,
    });
    await this.pgService.students.save(newStudent);

    const newUser = this.pgService.users.create({
      username: dto.username,
      email: dto.email,
      password: dto.password,
      student: newStudent
    });
    await this.pgService.users.save(newUser);

    this.logger.log(`Created new user with ID ${newUser.id} and a new student with ID ${newStudent.id}`);
    this.logger.log({ ...dto });
    return this.toOutDto(newUser);
  }

  public async put(id: number, dto: UserUpdateInDto): Promise<void> {
    const user = await this.pgService.users.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.pgService.users.update(id, {
      username: dto.username,
      email: dto.email,
      password: dto.password,
    });
    this.logger.log(`Updated user with ID ${id}`);
    this.logger.log({ ...dto });
  }

  public async delete(id: number): Promise<void> {
    const result = await this.pgService.users.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.logger.log(`Deleted user with ID ${id}`);
  }

  private toOutDto(user: User): UserOutDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      studentId: user.student?.id ?? 0
    };
  }

  private toOutDtoWithStudent(user: User): UserWithStudentOutDto{
    return{
      id: user.id,
      username: user.username,
      email: user.email,
      student: user.student,
    }
  }
}