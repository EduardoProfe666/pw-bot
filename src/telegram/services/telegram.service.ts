import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Hears, Help, On, Start, Update } from 'nestjs-telegraf';
import StudentsService from '../../students/services/students.service';
import AssessmentsService from '../../assessments/services/assessments.service';
import GradesService from '../../grades/services/grades.service';
import { Context } from 'node:vm';
import { AuthService } from '../../auth/services/auth.service';
import UsersService from '../../users/services/users.service';
import ReportsService from '../../reports/services/reports.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);

@Update()
@Injectable()
export default class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly defaultUsernameMessage = 'ImbÃ©cil sin "@"';
  private homeworkWaitingMap: Map<string, string> = new Map<string, string>();
  private chatIdProfessor = '5317290019';

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    @Inject(forwardRef(() => StudentsService))
    private readonly studentService: StudentsService,
    private readonly assessmentsService: AssessmentsService,
    private readonly gradesService: GradesService,
    private readonly reportService: ReportsService,
    private readonly configService: ConfigService,
  ) {}

  @Start()
  async startCommand(ctx: Context) {
    const username = await this.getUsername(ctx);
    const name = await this.extractName(username);
    
    // new
    const userId = await this.getUserID(ctx);

    try {
      await this.updateTelegramIdByUsername(username, userId); // Actualiza el ID en la BD
      await ctx.reply(
        `Hola ${name}, tu ID de Telegram se ha vinculado correctamente ðŸ˜Š.`,
        this.getMainKeyboard(),
      );
    } catch (error) {
      this.logger.error(`Error vinculando ID de Telegram: ${error.message}`);
      await ctx.reply(
        `Hola ${name}, hubo un problema al vincular tu ID de Telegram. Por favor, contacta al administrador.`,
      );
    }


    await ctx.reply(
      `Hola ${name}, estoy aquÃ­ para ayudarte ðŸ˜Š. Presiona los botones de abajo para saber mÃ¡s ðŸ‘‡. Â¿QuÃ© deseas hacer hoy?`,
      this.getMainKeyboard(),
    );
  }

  @Help()
  async help(ctx: Context) {
    const name = await this.extractName(await this.getUsername(ctx));

    await ctx.reply(
      `Hola ${name}, te lo dije hace un ratico pero bueno ðŸ™„... Parece que somos un poco retrasad... digo olvidadiz@s ðŸ¥´. Presiona los botones de abajo para saber mÃ¡s ðŸ‘‡.`,
      this.getMainKeyboard(),
    );
  }

  @Hears('Ver mis notas ðŸ“')
  async hearsGrades(ctx: Context) {
    const username = await this.getUsername(ctx);
    const name = await this.extractName(username);

    if (name === username) {
      await ctx.reply(`
      Hola ${name}, no sÃ© quiÃ©n eres, pero sÃ­ sÃ© 2 cosas de ti ðŸ˜ :\n
      1. No eres del grupo 31 ðŸ«µ.
      2. SÃ© donde vives ðŸ“... Ya te tengo bien localizado ðŸ™‚
      `);
    } else {
      let res = `Â¡Claro que sÃ­ ${name} ðŸ˜Š! AquÃ­ te muestro un listado de tus notas hasta ahora ðŸ“:\n\n`;
      res += '```\n' + (await this.generateGradesTable(username)) + '```';
      await ctx.reply(
        res.replace(/!/g, '\\!'),
        { parse_mode: 'MarkdownV2' },
        this.getMainKeyboard(),
      );
    }
  }

  @Hears('Observaciones ðŸ‘€')
  async hearsProfessorNotes(ctx: Context) {
    const username = await this.getUsername(ctx);
    const name = await this.extractName(username);

    if (name === username) {
      await ctx.reply(`
      Hola ${name}, no sÃ© quiÃ©n eres, pero sÃ­ sÃ© 2 cosas de ti ðŸ˜ :\n
      1. No eres del grupo 31 ðŸ«µ.
      2. SÃ© donde vives ðŸ“... Ya te tengo bien localizado ðŸ™‚
      `);
    } else {
      const assessments = (
        await this.gradesService.getByStudentUsername(username)
      )
        .map((x) => x.assessment.name)
        .sort((a, b) => a.localeCompare(b));

      if (assessments.length === 0) {
        await ctx.reply(
          `Hola ${name} ðŸ˜Š, no tienes ninguna evaluaciÃ³n y por tanto ninguna observaciÃ³n por el momento ðŸ¤·â€â™‚ï¸`,
          this.getMainKeyboard(),
        );
      } else {
        const inlineKeyboard = assessments.map((name) => [
          { text: name, callback_data: name },
        ]);

        await ctx.reply(
          `Hola ${name} ðŸ˜Š, selecciona una evaluaciÃ³n para ver las observaciones del profesor ðŸ§‘â€ðŸ«:`,
          {
            reply_markup: {
              inline_keyboard: inlineKeyboard,
            },
          },
          this.getMainKeyboard(),
        );
      }
    }
  }

  @Hears('Reportes ðŸ“„')
  async hearsReports(ctx: Context) {
    const username = await this.getUsername(ctx);
    const name = await this.extractName(username);

    if (name === username) {
      await ctx.reply(`
      Hola ${name}, no sÃ© quiÃ©n eres, pero sÃ­ sÃ© 2 cosas de ti ðŸ˜ :\n
      1. No eres del grupo 31 ðŸ«µ.
      2. SÃ© donde vives ðŸ“... Ya te tengo bien localizado ðŸ™‚
      `);
    } else {
      await ctx.reply(
        `Hola ${name} ðŸ˜Š, selecciona el reporte que quieras exportar ðŸ¤–:`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Exportar mis notas', callback_data: 'export_notes' }],
              [
                {
                  text: 'Exportar el ranking actual',
                  callback_data: 'export_ranking',
                },
              ],
            ],
          },
        },
        this.getMainKeyboard(),
      );
    }
  }

  @Hears('Entrega de Tareas ðŸ¤ ')
  async hearsHomeworks(ctx: Context) {
    const username = await this.getUsername(ctx);
    const name = await this.extractName(username);

    if (name === username) {
      await ctx.reply(`
      Hola ${name}, no sÃ© quiÃ©n eres, pero sÃ­ sÃ© 2 cosas de ti ðŸ˜ :\n
      1. No eres del grupo 31 ðŸ«µ.
      2. SÃ© donde vives ðŸ“... Ya te tengo bien localizado ðŸ™‚
      `);
    } else {
      const homeworks =
        await this.gradesService.missingGradeAssessmentsByUsername(username);

      if (homeworks.length === 0) {
        await ctx.reply(
          `Hola ${name} ðŸ˜Š, no tienes ninguna entrega programada por el momento ðŸ¤·â€â™‚ï¸...`,
          this.getMainKeyboard(),
        );
      } else {
        const inlineKeyboard = homeworks.map((name) => [
          { text: name, callback_data: `homework-${name}` },
        ]);

        await ctx.reply(
          `Hola ${name} ðŸ˜Š, selecciona una entrega pendiente ðŸ‘½:`,
          {
            reply_markup: {
              inline_keyboard: inlineKeyboard,
            },
          },
          this.getMainKeyboard(),
        );
      }
    }
  }

  @On('callback_query')
  async handleAssessmentCallback(ctx: Context) {
    const callbackData = ctx.callbackQuery.data;
    const username = await this.getUsername(ctx);
    const name = await this.extractName(username);
    let filePath: string;

    if (callbackData === 'export_notes' || callbackData === 'export_ranking') {
      try {
        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
          await mkdirAsync(tempDir);
        }

        if (callbackData === 'export_notes') {
          const buffer = await this.reportService.exportGradesTable(username);
          filePath = path.join(tempDir, 'Tus_Notas.pdf');
          fs.writeFileSync(filePath, buffer as string);
          await ctx.replyWithDocument({ source: filePath });
        } else if (callbackData === 'export_ranking') {
          const buffer = await this.reportService.exportRankingTable();
          filePath = path.join(tempDir, 'Ranking_Actual.pdf');
          fs.writeFileSync(filePath, buffer as string);
          await ctx.replyWithDocument({ source: filePath });
        }

        if (filePath) {
          await unlinkAsync(filePath);
        }
      } catch (error) {
        this.logger.error('Error generating report:', error);
        await ctx.reply(
          'Error generando el reporte ðŸ˜•. Por favor intenta de nuevo mÃ¡s tarde ðŸ‘¾.',
        );
      }
    } else if (callbackData.includes('homework-')) {
      this.homeworkWaitingMap[username] = callbackData.replace('homework-', '');
      await ctx.reply(
        `A continuaciÃ³n envÃ­ame tu tarea ðŸ˜Š... Ya veremos como lo hiciste ðŸ˜œ...`,
      );
    } else {
      const assessmentName = callbackData;
      const grade = (
        await this.gradesService.getByStudentUsername(username)
      ).find((x) => x.assessment.name === assessmentName);

      if (grade) {
        await ctx.reply(
          `Observaciones del profesor para ${assessmentName} ðŸ‘€:\n\nHola ${name} ðŸ˜Š. ${grade.professorNote}`,
          this.getMainKeyboard(),
        );
      } else {
        await ctx.reply(
          `Hola ${username} ðŸ˜Š. No hay observaciones disponibles para ${assessmentName} ðŸ¤·â€â™‚ï¸.`,
          this.getMainKeyboard(),
        );
      }
    }

    await ctx.answerCbQuery();
  }

  @On('document')
  async handleDocument(ctx: Context) {
    const username = await this.getUsername(ctx);
    const name = await this.extractName(username);

    if (name === username) {
      await ctx.reply(`
      Hola ${name}, no sÃ© quiÃ©n eres, pero sÃ­ sÃ© 2 cosas de ti ðŸ˜ :\n
      1. No eres del grupo 31 ðŸ«µ.
      2. SÃ© donde vives ðŸ“... Ya te tengo bien localizado ðŸ™‚
      `);
    } else if (!this.homeworkWaitingMap[username]) {
      await ctx.reply(
        'Para que me mandas eso ðŸ¤¨... Hasta donde sÃ© no has seleccionado ninguna entrega ðŸ¤“... No tendrÃ© el intelecto de ChatGPT, pero tÃº tampoco ðŸ˜Š.',
      );
    } else {
      const file = ctx.message.document;
      const fileName = file.file_name;
      const fileExtension = fileName.split('.').pop().toLowerCase();

      if (fileExtension === 'zip' || fileExtension === 'rar') {
        const student = await this.studentService.getByUsername(username);

        await ctx.telegram.sendDocument(this.chatIdProfessor, file.file_id, {
          caption: `
          Entrega de Tarea:
          - EvaluaciÃ³n: ${this.homeworkWaitingMap[username]}
          - Estudiante: ${name}
          - Nombre de Usuario: ${username}
          - Id de Estudiante: ${student.id}
          `,
        }); 

        this.homeworkWaitingMap[username] = undefined;
        await ctx.reply(
          `Recibido ${name} ðŸ˜Š... EstÃ¡s ahora en manos del jefe ðŸ«¡...`,
        );
      } else {
        await ctx.reply(
          'SerÃ¡s estÃºpid@ ðŸ˜®â€ðŸ’¨... Como piensas que mi creador va a revisarte si no le mandas tu entrega comprimida en un .zip o en un .rar ðŸ¤¨',
        );
      }
    }
  }

  @On('photo')
  async handlePhoto(ctx: Context) {
    await ctx.reply(`Para que me mandas esa foto ðŸ¤¨?`);
  }

  @On('video')
  async handleVideo(ctx: Context) {
    await ctx.reply(`Para que me mandas ese video ðŸ¤¨?`);
  }

  @Hears('Ranking del aula ðŸ“ˆ')
  async hearsRanking(ctx: Context) {
    const username = await this.getUsername(ctx);

    const name = await this.extractName(username);

    if (name === username) {
      await ctx.reply(`
      Hola ${name}, no sÃ© quiÃ©n eres, pero sÃ­ sÃ© 2 cosas de ti ðŸ˜ :\n
      1. No eres del grupo 31 ðŸ«µ.
      2. SÃ© donde vives ðŸ“... Ya te tengo bien localizado ðŸ™‚
      `);
    } else {
      let res = `Â¡Claro que sÃ­ ${name} ðŸ˜Š! AquÃ­ te muestro el ranking actual del aula sin los convalidadosðŸ“ˆ:\n\n`;
      res += '```\n' + (await this.generateRankingTable()) + '```';
      await ctx.reply(
        res.replace(/!/g, '\\!'),
        { parse_mode: 'MarkdownV2' },
        this.getMainKeyboard(),
      );
    }
  }

  @Hears('Â¿Estoy convalidado? ðŸ¤“')
  async hearsRecognized(ctx: Context) {
    const username = await this.getUsername(ctx);

    const name = await this.extractName(username);

    if (name === username) {
      await ctx.reply(`
      Hola ${name}, no sÃ© quiÃ©n eres, pero sÃ­ sÃ© 2 cosas de ti ðŸ˜ :\n
      1. No eres del grupo 31 ðŸ«µ.
      2. SÃ© donde vives ðŸ“... Ya te tengo bien localizado ðŸ™‚
      `);
    } else {
      const st = await this.studentService.getByUsername(username);
      if (st.isRecognized) {
        await ctx.reply(
          'Siiiiiuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu ðŸ¥³ðŸ¥³ðŸ¥³ðŸ¥³ðŸ¥³ðŸŽ‰ðŸŽ‰ðŸŽ‰ðŸŽ‰ðŸª…ðŸª©ðŸ‘¯ðŸ‘¯â€â™‚ï¸ðŸ‘¯â€â™€ï¸',
          this.getMainKeyboard(),
        );
      } else {
        await ctx.reply('Nop, sorry ðŸ«¤', this.getMainKeyboard());
      }
    }
  }

  @Hears('Se me olvidÃ³ mi contraseÃ±a ðŸ«¤')
  async hearsForgotPassword(ctx: Context) {
    const username = await this.getUsername(ctx);

    const name = await this.extractName(username);

    if (name === username) {
      await ctx.reply(`
      Hola ${name}, no sÃ© quiÃ©n eres, pero sÃ­ sÃ© 2 cosas de ti ðŸ˜ :\n
      1. No eres del grupo 31 ðŸ«µ.
      2. SÃ© donde vives ðŸ“... Ya te tengo bien localizado ðŸ™‚
      `);
    } else {
      const user = await this.userService.getByUsername(username);
      await this.authService.forgotPassword(user.email);
      ctx.reply(
        `Hola ${name}, parece que somos un poco retrasad... digo olvidadiz@s ðŸ¥´. Revisa tu correo para resetear tu contraseÃ±a ðŸ”‘. Esperemos que esta vez no se te olvide ðŸ˜Š.`,
        this.getMainKeyboard(),
      );
    }
  }

  @Hears('Enlace a Web App âš“')
  async hearsUrlUI(ctx: Context) {
    const username = await this.getUsername(ctx);

    const name = await this.extractName(username);

    if (name === username) {
      await ctx.reply(`
      Hola ${name}, no sÃ© quiÃ©n eres, pero sÃ­ sÃ© 2 cosas de ti ðŸ˜ :\n
      1. No eres del grupo 31 ðŸ«µ.
      2. SÃ© donde vives ðŸ“... Ya te tengo bien localizado ðŸ™‚
      `);
    } else {
      const url = this.configService.get<string>('APP_UI');
      ctx.reply(`Hola ${name} ðŸ˜Š, AquÃ­ tienes el enlace a la Web App: ${url} `, this.getMainKeyboard(),);
    }
  }

  @Hears(['hola', 'Hola', 'HOLA'])
  async hearsHello(ctx: Context) {
    const name = await this.extractName(await this.getUsername(ctx));

    await ctx.reply(
      `Hola ${name} ðŸ˜Š, cÃ³mo estas hoy ðŸ‘‹!`,
      this.getMainKeyboard(),
    );
  }

  @Hears('Â¿QuiÃ©n es tu creador? ðŸ¤”')
  async hearsCreator(ctx: Context) {
    await ctx.reply(
      `Mi creador es @eduardoProfe666, su hermoso y sexy profe ðŸ˜`,
      this.getMainKeyboard(),
    );
  }

  @On('sticker')
  async on(ctx: Context) {
    await ctx.reply('ðŸ‘‹', this.getMainKeyboard());
  }

  @On('text')
  async handleUnknownMessage(ctx: Context) {
    const name = await this.extractName(await this.getUsername(ctx));

    await ctx.reply(
      `Lo siento ${name}, pero no te entendÃ­ ðŸ¥´... No soy ChatGPT, estÃºpid@ ðŸ˜ƒ`,
      this.getMainKeyboard(),
    );
  }

  private async getUsername(ctx: Context): Promise<string> {
    return ctx.from.username || this.defaultUsernameMessage;
  }

  // new FN
  private async getUserID(ctx: Context): Promise<string>{
    return ctx.from?.id.toString();
  }


  // new FN
  private async updateTelegramIdByUsername(username: string, telegramId: string): Promise<void> {
    const user = await this.userService.getByUsername( username );
    
    if (!user) {
      throw new Error(`Usuario con username ${username} no encontrado`);
    }
  
    user.userIdTelegram = telegramId;
    await this.userService.updateUserTelegramID(user.id , user.userIdTelegram);
  }


  private async extractName(username: string): Promise<string> {
    try {
      return (await this.studentService.getByUsername(username)).name;
    } catch {
      this.logger.log(`The username ${username} is not registered`);
      return username;
    }
  }

  private async generateGradesTable(username: string): Promise<string> {
    const assessments = await this.assessmentsService.getAll();
    const gradeTable = await this.reportService.getGradesTable(username);
    let maxAssessmentNameLength = 'EvaluaciÃ³n'.length;

    for (const assessment of assessments) {
      maxAssessmentNameLength = Math.max(
        maxAssessmentNameLength,
        assessment.name.length,
      );
    }

    const columnWidth = Math.max(maxAssessmentNameLength, 20);

    let res = `+${'-'.repeat(columnWidth + 2)}+------+\n`;
    res += `| ${'EvaluaciÃ³n'.padEnd(columnWidth)} | Nota |\n`;
    res += `+${'-'.repeat(columnWidth + 2)}+------+\n`;

    for (const assessment of assessments) {
      const grade =
        gradeTable.gradeTable
          .find((x) => x.assessmentId == assessment.id)
          ?.grade?.toFixed(2) ?? '---';
      res += `| ${assessment.name.padEnd(columnWidth)} | ${grade.padEnd(4)} |\n`;
    }

    let average = gradeTable.avg;
    const avg = average > 0 ? average.toFixed(2) : '---';

    res += `+${'-'.repeat(columnWidth + 2)}+------+\n`;
    res += `| ${'Promedio'.padEnd(columnWidth)} | ${avg.padEnd(4)} |\n`;
    res += `+${'-'.repeat(columnWidth + 2)}+------+\n`;

    return res.replace(/!/g, '\\!');
  }

  private async generateRankingTable(): Promise<string> {
    const rankingTable = await this.reportService.getRankingTable();
    const studentIds = rankingTable.ranking.map((x) => x.studentId);
    const students = (await this.studentService.getAll()).filter((x) =>
      studentIds.includes(x.id),
    );

    let maxStudentNameLength = 'Estudiante'.length;

    for (const student of students) {
      maxStudentNameLength = Math.max(
        maxStudentNameLength,
        student.name.length,
      );
    }

    const columnWidth = Math.max(maxStudentNameLength, 20);

    let res = `+----+${'-'.repeat(columnWidth + 2)}+------+\n`;
    res += `| No | ${'Estudiante'.padEnd(columnWidth)} | Nota |\n`;
    res += `+----+${'-'.repeat(columnWidth + 2)}+------+\n`;

    for (const { studentId, avg, position } of rankingTable.ranking) {
      const st = students.find((x) => x.id === studentId);
      const average = avg > 0 ? avg.toFixed(2) : '---';
      res += `| ${position.toString().padEnd(2)} | ${st.name.padEnd(columnWidth)} | ${average.padEnd(4)} |\n`;
    }

    res += `+----+${'-'.repeat(columnWidth + 2)}+------+\n`;

    return res.replace(/!/g, '\\!');
  }

  private getMainKeyboard() {
    return {
      reply_markup: {
        keyboard: [
          [{ text: 'Ver mis notas ðŸ“' }, { text: 'Observaciones ðŸ‘€' }],
          [
            { text: 'Â¿QuiÃ©n es tu creador? ðŸ¤”' },
            { text: 'Ranking del aula ðŸ“ˆ' },
          ],
          [
            { text: 'Â¿Estoy convalidado? ðŸ¤“' },
            { text: 'Se me olvidÃ³ mi contraseÃ±a ðŸ«¤' },
          ],
          [{ text: 'Enlace a Web App âš“' }, { text: 'Reportes ðŸ“„' }],
          [{ text: 'Entrega de Tareas ðŸ¤ ' }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    };
  }
}
