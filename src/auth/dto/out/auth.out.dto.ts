import { ApiProperty } from '@nestjs/swagger';

export default class AuthOutDto{
  @ApiProperty()
  token: string;
}