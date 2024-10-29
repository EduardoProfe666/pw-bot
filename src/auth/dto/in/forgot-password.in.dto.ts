import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';


export default class ForgotPasswordInDto{
  @ApiProperty()
  @IsEmail()
  email: string;
}