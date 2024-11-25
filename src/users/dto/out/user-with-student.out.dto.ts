import { ApiProperty } from '@nestjs/swagger';
import Student from '../../../database/entities/student.entity';

export default class UserWithStudentOutDto{
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  //new
  @ApiProperty()
  userIdTelegram: string;

  @ApiProperty({type: Student})
  student: Student;
}