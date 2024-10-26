import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export default class AssessmentInDto{
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}