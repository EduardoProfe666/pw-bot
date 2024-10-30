import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export default class StudentInDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsBoolean()
  isRecognized: boolean;

  @ApiProperty()
  @IsBoolean()
  isRepeater: boolean;

  @ApiProperty()
  @IsBoolean()
  isCarryForward: boolean;

  @ApiProperty()
  @IsInt()
  @Min(1)
  listNumber: number;
}