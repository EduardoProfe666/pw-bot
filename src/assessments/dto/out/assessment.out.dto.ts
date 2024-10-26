import { ApiProperty } from '@nestjs/swagger';

export default class AssessmentOutDto{
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
