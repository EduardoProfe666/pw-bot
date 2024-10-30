import { ApiProperty } from '@nestjs/swagger';

export class GradeRow{
  @ApiProperty()
  gradeId: number;

  @ApiProperty()
  assessmentName: string;

  @ApiProperty()
  assessmentId: number;

  @ApiProperty({nullable: true})
  grade: 2 | 3 | 4 | 5 | null;
}

export default class GradesTableOutDto{
  @ApiProperty({type: [GradeRow]})
  gradeTable: GradeRow[];

  @ApiProperty()
  avg: number;

  @ApiProperty()
  studentId: number;
}
