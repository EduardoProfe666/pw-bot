import { ApiProperty } from '@nestjs/swagger';

export default class AvgGradeOutDto{
  @ApiProperty()
  avg: number;
}