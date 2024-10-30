import { Injectable, Logger } from '@nestjs/common';
import { Hears, Help, On, Start, Update } from 'nestjs-telegraf';
import StudentsService from '../../students/services/students.service';
import AssessmentsService from '../../assessments/services/assessments.service';
import GradesService from '../../grades/services/grades.service';
import { Context } from 'node:vm';
import PgService from '../../database/services/pg.service';
import { AuthService } from '../../auth/services/auth.service';
import UsersService from '../../users/services/users.service';

@Update()
@Injectable()
export default class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly defaultUsernameMessage = 'Imbécil sin "@"';

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly studentService: StudentsService,
    private readonly assessmentsService: AssessmentsService,
    private readonly gradesService: GradesService,
  ) {}

  @Start()
  async startCommand(ctx: Context) {
    const name = await this.extractName(await this.getUsername(ctx));

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
      await ctx.reply(res.replace(/!/g, '\\!'), { parse_mode: 'MarkdownV2' });
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
        );
      }
    }
  }

  @On('callback_query')
  async handleAssessmentCallback(ctx: Context) {
    const assessmentName = ctx.callbackQuery.data;
    const username = await this.getUsername(ctx);
    const name = await this.extractName(username);
    const grade = (
      await this.gradesService.getByStudentUsername(username)
    ).find((x) => x.assessment.name === assessmentName);

    if (grade) {
      await ctx.reply(
        `Observaciones del profesor para ${assessmentName} 👀:\n\nHola ${name} 😊. ${grade.professorNote}`,
      );
    } else {
      await ctx.reply(
        `Hola ${username} 😊. No hay observaciones disponibles para ${assessmentName} 🤷‍♂️.`,
      );
    }

    await ctx.answerCbQuery();
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
      let res = `¡Claro que sí ${name} 😊! Aquí te muestro el ranking actual del aula (Sin los convalidados)📈:\n\n`;
      res += '```\n' + (await this.generateRankingTable()) + '```';
      await ctx.reply(res.replace(/!/g, '\\!'), { parse_mode: 'MarkdownV2' });
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
      if(st.isRecognized){
        await ctx.reply('Siiiiiuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu 🥳🥳🥳🥳🥳🎉🎉🎉🎉🪅🪩👯👯‍♂️👯‍♀️');
      }
      else{
        await ctx.reply('Nop, sorry 🫤');
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
      ctx.reply(`Hola ${name}, parece que somos un poco retrasad... digo olvidadiz@s 🥴. Revisa tu correo para resetear tu contraseña 🔑. Esperemos que esta vez no se te olvide 😊.`);
    }
  }

  @Hears(['hola', 'Hola', 'HOLA'])
  async hearsHello(ctx: Context) {
    const name = await this.extractName(await this.getUsername(ctx));

    await ctx.reply(`Hola ${name} 😊, cómo estas hoy 👋!`);
  }

  @Hears('¿Quién es tu creador? 🤔')
  async hearsCreator(ctx: Context) {
    await ctx.reply(
      `Mi creador es @eduardoProfe666, su hermoso y sexy profe 😏`
    );
  }

  @On('sticker')
  async on(ctx: Context) {
    await ctx.reply('👋');
  }

  @On('text')
  async handleUnknownMessage(ctx: Context) {
    const name = await this.extractName(await this.getUsername(ctx));

    await ctx.reply(
      `Lo siento ${name}, pero no te entendí 🥴... No soy ChatGPT, estúpid@ 😃`
    );
  }

  private async getUsername(ctx: Context): Promise<string> {
    return ctx.from.username || this.defaultUsernameMessage;
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
    const grades = await this.gradesService.getByStudentUsername(username);
    const assessments = await this.assessmentsService.getAll();

    const gradesMap = new Map<string, string>();
    let totalGrades = 0;
    let countGrades = 0;

    let maxAssessmentNameLength = 'Evaluación'.length;

    for (const grade of grades) {
      gradesMap.set(
        grade.assessment.name,
        grade.grade ? grade.grade.toString() : '---',
      );
      if (grade.grade) {
        totalGrades += grade.grade;
        countGrades++;
      }
    }

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
      const grade = gradesMap.get(assessment.name) || '---';
      res += `| ${assessment.name.padEnd(columnWidth)} | ${grade.padEnd(4)} |\n`;
    }

    const average =
      countGrades > 0 ? (totalGrades / countGrades).toFixed(2) : '---';

    res += `+${'-'.repeat(columnWidth + 2)}+------+\n`;
    res += `| ${'Promedio'.padEnd(columnWidth)} | ${average.padEnd(4)} |\n`;
    res += `+${'-'.repeat(columnWidth + 2)}+------+\n`;

    return res.replace(/!/g, '\\!');
  }

  private async generateRankingTable(): Promise<string> {
    const students = await this.studentService.getAll();
    const rankingMap = new Map<number, { name: string; average: string }>();
    let maxStudentNameLength = 'Estudiante'.length;

    for (const student of students.filter(
      (x) => x.username !== 'eduardoProfe666' && !x.isRecognized,
    )) {
      let totalGrades = 0;
      let countGrades = 0;

      const grades = await this.gradesService.getByStudentId(student.id);
      grades.forEach((x) => {
        if (x.grade) {
          totalGrades += x.grade;
          countGrades++;
        }
      });

      const average =
        countGrades > 0 ? (totalGrades / countGrades).toFixed(2) : '---';
      rankingMap.set(student.id, { name: student.name, average });
      maxStudentNameLength = Math.max(
        maxStudentNameLength,
        student.name.length,
      );
    }

    const rankingArray = Array.from(rankingMap.values()).sort((a, b) => {
      if (a.average === '---' && b.average === '---') return 0;
      if (a.average === '---') return 1;
      if (b.average === '---') return -1;
      return parseFloat(b.average) - parseFloat(a.average);
    });

    const columnWidth = Math.max(maxStudentNameLength, 20);

    let res = `+----+${'-'.repeat(columnWidth + 2)}+------+\n`;
    res += `| No | ${'Estudiante'.padEnd(columnWidth)} | Nota |\n`;
    res += `+----+${'-'.repeat(columnWidth + 2)}+------+\n`;

    let pos = 0;
    let prevAvg = '';

    for (const { name, average } of rankingArray) {
      if (average !== prevAvg) {
        pos += 1;
        prevAvg = average;
      }
      res += `| ${pos.toString().padEnd(2)} | ${name.padEnd(columnWidth)} | ${average.padEnd(4)} |\n`;
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
            {text: '¿Estoy convalidado? 🤓'},
            {text: 'Se me olvidó mi contraseña 🫤'}
          ]
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    };
  }
}
