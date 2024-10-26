import { ApiProperty } from '@nestjs/swagger';
import AssessmentOutDto from '../../../assessments/dto/out/assessment.out.dto';

export default class GradeOutDto{
  @ApiProperty()
  id: number;

  @ApiProperty()
  professorNote: string;

  @ApiProperty({ enum: [2, 3, 4, 5], nullable: true })
  grade: 2 | 3 | 4 | 5 | null;

  @ApiProperty()
  studentId: number;

  @ApiProperty()
  assessmentId: number;
}