import { ApiProperty } from '@nestjs/swagger';

export default class StudentOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  isRecognized: boolean;
}