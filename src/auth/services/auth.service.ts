import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import UsersService from '../../users/services/users.service';
import PgService from '../../database/services/pg.service';
import * as bcrypt from 'bcrypt';
import MailService from '../../mail/services/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly pgService: PgService,
    private readonly mailService: MailService,
  ) {}

  async login(username: string, password: string): Promise<string> {
    const adminUsername = this.configService.get<string>('ADMIN_USERNAME');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (username === adminUsername && password === adminPassword) {
      const payload = { username, role: 'admin' };
      return this.jwtService.sign(payload);
    }

    const user = await this.pgService.users.findOne({
      where: { username },
      relations: ['student'],
    });
    console.log(await user.validatePassword(password))

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

  async changePassword(
    username: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.pgService.users.findOne({
      where: { username },
    });
    if (!user || !(await user.validatePassword(oldPassword))) {
      throw new BadRequestException('Invalid credentials');
    }

    user.password = newPassword;

    await this.pgService.users.save(user)

    this.logger.log(`Updated user Password with ID ${user.id} and Username ${user.username}`);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.pgService.users.findOne({
      where: { email },
      relations: ['student']
    });
    if(!user){
      throw new NotFoundException();
    }

    const payload = {email: email};
    const token = this.jwtService.sign(payload);

    return this.mailService.sendResetPasswordEmail(email, user.student.name, token);
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    const email = await this.decodeConfirmationToken(resetToken);

    const user = await this.pgService.users.findOne({
      where: { email },
    })
    if(!user){
      throw new UnauthorizedException();
    }

    user.password = newPassword;
    await this.pgService.users.save(user)
  }

  private async decodeConfirmationToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token);

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new UnauthorizedException();
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
