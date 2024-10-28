import { ApiProperty } from '@nestjs/swagger';
import GradeWithAssessmentOutDto from '../../../grades/dto/out/grade-with-assessment.out.dto';

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
}