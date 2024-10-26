import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export default class GradeInDto{
  @ApiProperty({ enum: [2, 3, 4, 5], nullable: true, required: false })
  @IsOptional()
  @IsEnum([2, 3, 4, 5])
  grade: 2 | 3 | 4 | 5 | null;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  professorNote: string;

  @ApiProperty()
  @IsNotEmpty()
  assessmentId: number;

  @ApiProperty()
  @IsNotEmpty()
  studentId: number;
}