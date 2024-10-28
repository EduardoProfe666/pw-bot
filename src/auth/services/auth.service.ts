import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import UsersService from '../../users/services/users.service';
import PgService from '../../database/services/pg.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly pgService: PgService,
    ) {}

  async login(username: string, password: string): Promise<string> {
    const adminUsername = this.configService.get<string>('ADMIN_USERNAME');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (username === adminUsername && password === adminPassword) {
      const payload = { username, role: 'admin' };
      return this.jwtService.sign(payload);
    }

    const user = await this.pgService.users.findOne({where: {username}, relations: ['student']});
    if (!user || !(await user.validatePassword(password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      username: user.username,
      email: user.email,
      name: user.student.name,
      fullName: user.student.fullName,
      userId: user.id,
      studentId: user.student.id,
      role: 'student',
    };

    return this.jwtService.sign(payload);
  }
}