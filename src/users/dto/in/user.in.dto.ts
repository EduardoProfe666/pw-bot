import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail, IsInt,
  IsNotEmpty,
  IsString,
  Length, Matches, Min,
  MinLength,
} from 'class-validator';

export default class UserInDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[0-9])/, {
    message: 'password must contain at least one number.',
  })
  @Matches(/(?=.*\W)/, {
    message: 'password must contain at least one special character.',
  })
    @Matches(/(?=.*[A-Z])/, {
    message: 'password must contain at least one uppercase letter.',
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  listNumber: number;

  @ApiProperty()
  @IsBoolean()
  isRepeater: boolean;

  @ApiProperty()
  @IsBoolean()
  isCarryForward: boolean;
}
