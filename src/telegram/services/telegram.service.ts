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
  private readonly defaultUsernameMessage = 'Imbécil sin "@"';
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
      
    } catch (error) {
      this.logger.error(`Error vinculando ID de Telegram: ${error.message}`);
    }


    await ctx.reply(
      `Hola ${name}, estoy aquí para ayudarte 😊. Presiona los botones de abajo para saber más 👇. ¿Qué deseas hacer hoy?`,
      this.getMainKeyboard(),
    );
  }

  @Help()
  async help(ctx: Context) {
    const name = await this.extractName(await this.getUsername(ctx));

    await ctx.reply(
      `Hola ${name}, te lo dije hace un ratico pero bueno 🙄... Parece que somos un poco retrasad... digo olvidadiz@s 🥴. Presiona los botones de abajo para saber más 👇.`,
      this.getMainKeyboard(),
    );
  }

  @Hears('Ver mis notas 📝')
  async hearsGrades(ctx: Context) {
    const username = await this.getUsername(ctx);
    const name = await this.extractName(username);

    if (name === username) {
      await ctx.reply(`
      Hola ${name}, no sé quién eres, pero sí sé 2 cosas de ti 😠:\n
      1. No eres del grupo 31 🫵.
      2. Sé donde vives 📍... Ya te tengo bien localizado 🙂
      `);
    } else {
      let res = `¡Claro que sí ${name} 😊! Aquí te muestro un listado de tus notas hasta ahora 📝:\n\n`;
      res += '```\n' + (await this.generateGradesTable(username)) + '```';
      await ctx.reply(
        res.replace(/!/g, '\\!'),
        { parse_mode: 'MarkdownV2' },
        this.getMainKeyboard(),
      );
    }
  }

  @Hears('Observaciones 👀')
  async hearsProfessorNotes(ctx: Context) {
    const username = await this.getUsername(ctx);
    const name = await this.extractName(username);

    if (name === username) {
      await ctx.reply(`
      Hola ${name}, no sé quién eres, pero sí sé 2 cosas de ti 😠:\n
      1. No eres del grupo 31 🫵.
      2. Sé donde vives 📍... Ya te tengo bien localizado 🙂
      `);
    } else {
      const assessments = (
        await this.gradesService.getByStudentUsername(username)
      )
        .map((x) => x.assessment.name)
        .sort((a, b) => a.localeCompare(b));

      if (assessments.length === 0) {
        await ctx.reply(
          `Hola ${name} 😊, no tienes ninguna evaluación y por tanto ninguna observación por el momento 🤷‍♂️`,
          this.getMainKeyboard(),
        );
      } else {
        const inlineKeyboard = assessments.map((name) => [
          { text: name, callback_data: name },
        ]);

        await ctx.reply(
          `Hola ${name} 😊, selecciona una evaluación para ver las observaciones del profesor 🧑‍🏫:`,
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

  @Hears('Reportes 📄')
  async hearsReports(ctx: Context) {
    const username = await this.getUsername(ctx);
    const name = await this.extractName(username);

    if (name === username) {
      await ctx.reply(`
      Hola ${name}, no sé quién eres, pero sí sé 2 cosas de ti 😠:\n
      1. No eres del grupo 31 🫵.
      2. Sé donde vives 📍... Ya te tengo bien localizado 🙂
      `);
    } else {
      await ctx.reply(
        `Hola ${name} 😊, selecciona el reporte que quieras exportar 🤖:`,
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

  @Hears('Entrega de Tareas 🤠')
  async hearsHomeworks(ctx: Context) {
    const username = await this.getUsername(ctx);
    const name = await this.extractName(username);

    if (name === username) {
      await ctx.reply(`
      Hola ${name}, no sé quién eres, pero sí sé 2 cosas de ti 😠:\n
      1. No eres del grupo 31 🫵.
      2. Sé donde vives 📍... Ya te tengo bien localizado 🙂
      `);
    } else {
      const homeworks =
        await this.gradesService.missingGradeAssessmentsByUsername(username);

      if (homeworks.length === 0) {
        await ctx.reply(
          `Hola ${name} 😊, no tienes ninguna entrega programada por el momento 🤷‍♂️...`,
          this.getMainKeyboard(),
        );
      } else {
        const inlineKeyboard = homeworks.map((name) => [
          { text: name, callback_data: `homework-${name}` },
        ]);

        await ctx.reply(
          `Hola ${name} 😊, selecciona una entrega pendiente 👽:`,
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
          'Error generando el reporte 😕. Por favor intenta de nuevo más tarde 👾.',
        );
      }
    } else if (callbackData.includes('homework-')) {
      this.homeworkWaitingMap[username] = callbackData.replace('homework-', '');
      await ctx.reply(
        `A continuación envíame tu tarea 😊... Ya veremos como lo hiciste 😜...`,
      );
    } else {
      const assessmentName = callbackData;
      const grade = (
        await this.gradesService.getByStudentUsername(username)
      ).find((x) => x.assessment.name === assessmentName);

      if (grade) {
        await ctx.reply(
          `Observaciones del profesor para ${assessmentName} 👀:\n\nHola ${name} 😊. ${grade.professorNote}`,
          this.getMainKeyboard(),
        );
      } else {
        await ctx.reply(
          `Hola ${username} 😊. No hay observaciones disponibles para ${assessmentName} 🤷‍♂️.`,
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
      Hola ${name}, no sé quién eres, pero sí sé 2 cosas de ti 😠:\n
      1. No eres del grupo 31 🫵.
      2. Sé donde vives 📍... Ya te tengo bien localizado 🙂
      `);
    } else if (!this.homeworkWaitingMap[username]) {
      await ctx.reply(
        'Para que me mandas eso 🤨... Hasta donde sé no has seleccionado ninguna entrega 🤓... No tendré el intelecto de ChatGPT, pero tú tampoco 😊.',
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
          - Evaluación: ${this.homeworkWaitingMap[username]}
          - Estudiante: ${name}
          - Nombre de Usuario: ${username}
          - Id de Estudiante: ${student.id}
          `,
        }); 

        this.homeworkWaitingMap[username] = undefined;
        await ctx.reply(
          `Recibido ${name} 😊... Estás ahora en manos del jefe 🫡...`,
        );
      } else {
        await ctx.reply(
          'Serás estúpid@ 😮‍💨... Como piensas que mi creador va a revisarte si no le mandas tu entrega comprimida en un .zip o en un .rar 🤨',
        );
      }
    }
  }

  @On('photo')
  async handlePhoto(ctx: Context) {
    await ctx.reply(`Para que me mandas esa foto 🤨?`);
  }

  @On('video')
  async handleVideo(ctx: Context) {
    await ctx.reply(`Para que me mandas ese video 🤨?`);
  }

  @Hears('Ranking del aula 📈')
  async hearsRanking(ctx: Context) {
    const username = await this.getUsername(ctx);

    const name = await this.extractName(username);

    if (name === username) {
      await ctx.reply(`
      Hola ${name}, no sé quién eres, pero sí sé 2 cosas de ti 😠:\n
      1. No eres del grupo 31 🫵.
      2. Sé donde vives 📍... Ya te tengo bien localizado 🙂
      `);
    } else {
      let res = `¡Claro que sí ${name} 😊! Aquí te muestro el ranking actual del aula sin los convalidados📈:\n\n`;
      res += '```\n' + (await this.generateRankingTable()) + '```';
      await ctx.reply(
        res.replace(/!/g, '\\!'),
        { parse_mode: 'MarkdownV2' },
        this.getMainKeyboard(),
      );
    }
  }

  @Hears('¿Estoy convalidado? 🤓')
  async hearsRecognized(ctx: Context) {
    const username = await this.getUsername(ctx);

    const name = await this.extractName(username);

    if (name === username) {
      await ctx.reply(`
      Hola ${name}, no sé quién eres, pero sí sé 2 cosas de ti 😠:\n
      1. No eres del grupo 31 🫵.
      2. Sé donde vives 📍... Ya te tengo bien localizado 🙂
      `);
    } else {
      const st = await this.studentService.getByUsername(username);
      if (st.isRecognized) {
        await ctx.reply(
          'Siiiiiuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu 🥳🥳🥳🥳🥳🎉🎉🎉🎉🪅🪩👯👯‍♂️👯‍♀️',
          this.getMainKeyboard(),
        );
      } else {
        await ctx.reply('Nop, sorry 🫤', this.getMainKeyboard());
      }
    }
  }

  @Hears('Se me olvidó mi contraseña 🫤')
  async hearsForgotPassword(ctx: Context) {
    const username = await this.getUsername(ctx);

    const name = await this.extractName(username);

    if (name === username) {
      await ctx.reply(`
      Hola ${name}, no sé quién eres, pero sí sé 2 cosas de ti 😠:\n
      1. No eres del grupo 31 🫵.
      2. Sé donde vives 📍... Ya te tengo bien localizado 🙂
      `);
    } else {
      const user = await this.userService.getByUsername(username);
      await this.authService.forgotPassword(user.email);
      ctx.reply(
        `Hola ${name}, parece que somos un poco retrasad... digo olvidadiz@s 🥴. Revisa tu correo para resetear tu contraseña 🔑. Esperemos que esta vez no se te olvide 😊.`,
        this.getMainKeyboard(),
      );
    }
  }

  @Hears('Enlace a Web App ⚓')
  async hearsUrlUI(ctx: Context) {
    const username = await this.getUsername(ctx);

    const name = await this.extractName(username);

    if (name === username) {
      await ctx.reply(`
      Hola ${name}, no sé quién eres, pero sí sé 2 cosas de ti 😠:\n
      1. No eres del grupo 31 🫵.
      2. Sé donde vives 📍... Ya te tengo bien localizado 🙂
      `);
    } else {
      const url = this.configService.get<string>('APP_UI');
      ctx.reply(`Hola ${name} 😊, Aquí tienes el enlace a la Web App: ${url} `, this.getMainKeyboard(),);
    }
  }

  @Hears(['hola', 'Hola', 'HOLA'])
  async hearsHello(ctx: Context) {
    const name = await this.extractName(await this.getUsername(ctx));

    await ctx.reply(
      `Hola ${name} 😊, cómo estas hoy 👋!`,
      this.getMainKeyboard(),
    );
  }

  @Hears('¿Quién es tu creador? 🤔')
  async hearsCreator(ctx: Context) {
    await ctx.reply(
      `Mi creador es @eduardoProfe666, su hermoso y sexy profe 😏`,
      this.getMainKeyboard(),
    );
  }

  @On('sticker')
  async on(ctx: Context) {
    await ctx.reply('👋', this.getMainKeyboard());
  }

  @On('text')
  async handleUnknownMessage(ctx: Context) {
    const name = await this.extractName(await this.getUsername(ctx));

    await ctx.reply(
      `Lo siento ${name}, pero no te entendí 🥴... No soy ChatGPT, estúpid@ 😃`,
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
  
    await this.userService.updateUserTelegramID(user.id , telegramId);
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
    let maxAssessmentNameLength = 'Evaluación'.length;

    for (const assessment of assessments) {
      maxAssessmentNameLength = Math.max(
        maxAssessmentNameLength,
        assessment.name.length,
      );
    }

    const columnWidth = Math.max(maxAssessmentNameLength, 20);

    let res = `+${'-'.repeat(columnWidth + 2)}+------+\n`;
    res += `| ${'Evaluación'.padEnd(columnWidth)} | Nota |\n`;
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
          [{ text: 'Ver mis notas 📝' }, { text: 'Observaciones 👀' }],
          [
            { text: '¿Quién es tu creador? 🤔' },
            { text: 'Ranking del aula 📈' },
          ],
          [
            { text: '¿Estoy convalidado? 🤓' },
            { text: 'Se me olvidó mi contraseña 🫤' },
          ],
          [{ text: 'Enlace a Web App ⚓' }, { text: 'Reportes 📄' }],
          [{ text: 'Entrega de Tareas 🤠' }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    };
  }
}
