import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import ForgotPasswordTemplate from '../templates/forgot-password.template';
import GradeNotificationTemplate from '../templates/grade-notification.template';

@Injectable()
export default class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(MailService.name);
  private readonly RESET_PASSWORD_SUBJECT: string =
    'Resetear Contraseña en PW G-31 App';
  private readonly GRADE_NOTIFICATION_SUBJECT: string =
    'Notificación de calificación';

  async sendGradeNotificationEmail(
    email: string,
    name: string,
    assessment: string,
    grade: number,
    professorNote: string,
  ): Promise<void> {
    const message = new GradeNotificationTemplate(
      name,
      assessment,
      grade,
      professorNote,
    ).getEmail();
    await this.sendMail(email, this.GRADE_NOTIFICATION_SUBJECT, message);
  }

  async sendResetPasswordEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get<string>('EMAIL_RESET_PASSWORD_URL')}?token=${token}`;
    this.logger.log(resetUrl);
    const message = new ForgotPasswordTemplate(
      this.configService.get<string>('APP_UI'),
      name,
      resetUrl,
    ).getEmail();

    await this.sendMail(email, this.RESET_PASSWORD_SUBJECT, message);
  }

  private async sendMail(email: string, subject: string, message: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: {
          name: this.configService.get<string>('SENDER_NAME'),
          address: this.configService.get('SENDER_EMAIL'),
        },
        subject: subject,
        html: message,
        sender: {
          name: this.configService.get('SENDER_NAME'),
          address: this.configService.get('SENDER_EMAIL'),
        },
      });
      this.logger.log('Successfully sent email', email, subject);
      return {
        success: true,
      };
    } catch (error) {
      this.logger.log('Failed to send email', email, subject);
      return {
        success: false,
      };
    }
  }
}
