import { ApiProperty } from '@nestjs/swagger';

export default class UserOutDto{
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  studentId: number;
}