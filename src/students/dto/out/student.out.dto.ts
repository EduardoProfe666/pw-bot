import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

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

  @ApiProperty()
  listNumber: number;

  @ApiProperty()
  isRepeater: boolean;

  @ApiProperty()
  isCarryForward: boolean;
}