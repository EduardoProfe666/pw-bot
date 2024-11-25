import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import * as ExcelJS from 'exceljs';
import RankingTableOutDto, {
  RankingRow,
} from '../dto/out/ranking-table.out.dto';
import StudentsService from '../../students/services/students.service';
import GradesService from '../../grades/services/grades.service';
import GradesTableOutDto, { GradeRow } from '../dto/out/grades-table.out.dto';
import AssessmentsService from '../../assessments/services/assessments.service';
import UserWithStudentOutDto from '../../users/dto/out/user-with-student.out.dto';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import MailService from '../../mail/services/mail.service';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Injectable()
export default class ReportsService {
  constructor(
    private readonly pgService: PgService,
    @Inject(forwardRef(() => GradesService))
    private readonly gradesService: GradesService,
    @Inject(forwardRef(() => StudentsService))
    private readonly studentService: StudentsService,
    private readonly mailService: MailService,
  ) {}

  private readonly logger = new Logger(ReportsService.name);
  private readonly PROFESSOR_USERNAME: string = 'eduardoProfe666';

  public async getRankingTable(): Promise<RankingTableOutDto> {
    const students = await this.studentService.getAll();
    const grades = await this.gradesService.getAll();
    const rankingMap = new Map<
      number,
      { studentId: number; average: number; count: number }
    >();
    const getAvgCount = (studentId: number) => {
      const gradess = grades.filter((grade) => grade.studentId === studentId);
      if (gradess) {
        let totalGrades = 0;
        let countGrades = 0;

        gradess.forEach((grade) => {
          if (grade.grade) {
            totalGrades += grade.grade;
            countGrades++;
          }
        });

        const average =
          countGrades > 0
            ? parseFloat((totalGrades / countGrades).toFixed(2))
            : 0;
        return { average, count: countGrades };
      }
      return { average: 0, count: 0 };
    };
    for (const student of students.filter(
      (x) => x.username !== this.PROFESSOR_USERNAME && !x.isRecognized,
    )) {
      const { average, count } = getAvgCount(student.id);
      rankingMap.set(student.id, { studentId: student.id, average, count });
    }

    const rankingArray = Array.from(rankingMap.values()).sort((a, b) => {
      if (a.average === b.average) {
        return b.count - a.count;
      }
      return b.average - a.average;
    });

    const rankingRows: RankingRow[] = [];

    let pos = 0;
    let prevAvg = null;
    let prevCount = null;

    for (const { studentId, average, count } of rankingArray) {
      if (average !== prevAvg) {
        pos += 1;
        prevAvg = average;
      } else if (count !== prevCount) {
        if (prevCount === null) prevCount = count;
        else {
          pos += 1;
          prevCount = count;
        }
      }
      rankingRows.push({ studentId: studentId, avg: average, position: pos });
    }

    return {
      ranking: rankingRows,
    };
  }

  public async checkPosChanges(prevRankingTable: RankingTableOutDto) {
    const actualRankingTable = await this.getRankingTable();

    const prevRanking = prevRankingTable.ranking;
    const actualRanking = actualRankingTable.ranking;

    const rankingStudentIds = prevRanking.map((x) => x.studentId);

    const students = (
      await this.pgService.students.find({ relations: ['user'] })
    ).filter((x) => rankingStudentIds.includes(x.id));

    for (const student of students) {
      const prev = prevRanking.find((x) => x.studentId === student.id);
      const actual = actualRanking.find((x) => x.studentId === student.id);

      if (prev.position != actual.position) {
        await this.mailService.sendRankingUpdateNotification(
          student.user.email,
          student.name,
          prev.position,
          actual.position,
        );
      }
    }
  }

  public async getGradesTable(username: string): Promise<GradesTableOutDto> {
    const grades = await this.gradesService.getByStudentUsername(username);
    const student = await this.studentService.getByUsername(username);

    const gradeRows: GradeRow[] = [];

    for (const grade of grades) {
      gradeRows.push({
        grade: grade.grade,
        gradeId: grade.id,
        assessmentId: grade.assessment.id,
        assessmentName: grade.assessment.name,
        professorNote: grade.professorNote,
      });
    }

    return {
      gradeTable: gradeRows,
      studentId: student.id,
      avg: await this.gradesService.getAvgByStudentUsername(username),
    };
  }

  public async exportRankingTable() {
    const rankingTable: RankingTableOutDto = await this.getRankingTable();

    const documentDefinition =
      await this.createRankingTableDocumentDefinition(rankingTable);
    return new Promise((resolve, reject) => {
      const pdfDoc = (pdfMake as any).createPdf(documentDefinition);
      pdfDoc.getBuffer((buffer) => {
        resolve(buffer);
      });
    });
  }

  private async createRankingTableDocumentDefinition(
    rankingTable: RankingTableOutDto,
  ) {
    const today = new Date().toLocaleDateString('es-ES');
    const totalStudents = rankingTable.ranking.length;
    const students = await this.studentService.getAll();

    return {
      content: [
        {
          text: 'PW G-31 System',
          alignment: 'right',
          margin: [0, 0, 20, 20],
        },
        {
          text: 'Ranking Actual del Aula',
          style: 'header',
          alignment: 'center',
          bold: true,
          fontSize: 20,
          margin: [0, 0, 0, 20],
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto'],
            body: [
              [
                { text: 'Pos.', style: 'tableHeader' },
                { text: 'Estudiante', style: 'tableHeader' },
                {
                  text: 'Promedio',
                  style: 'tableHeader',
                },
              ],
              ...rankingTable.ranking.map((row) => [
                row.position,
                students.find((x) => x.id === row.studentId)?.fullName || '',
                row.avg,
              ]),
              [
                { text: '', colSpan: 2 },
                {},
                {
                  text: `Total de Estudiantes: ${totalStudents}`,
                  style: 'totalRow',
                },
              ],
            ],
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? '#f2f2f2' : null),
            hLineColor: () => '#cccccc',
            vLineColor: () => '#cccccc',
          },
        },
      ],
      footer: (currentPage, pageCount) => {
        return [
          {
            columns: [
              {
                text: ` Fecha: ${today}`,
                alignment: 'left',
              },
              {
                text: `Página ${currentPage} de ${pageCount} `,
                alignment: 'right',
              },
            ],
            margin: [0, 10],
          },
        ];
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true,
        },
        tableHeader: {
          fillColor: '#4CAF50',
          color: '#ffffff',
          fontSize: 12,
          bold: true,
          alignment: 'center',
        },
        totalRow: {
          bold: true,
          fontSize: 12,
        },
      },
      defaultStyle: {
        fontSize: 12,
      },
    };
  }

  public async exportStudentList() {
    const users = await this.pgService.users.find({ relations: ['student'] });

    const userDtos: UserWithStudentOutDto[] = users
      .map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        student: user.student,
        userIdTelegram : user.userIdTelegram
      }))
      .filter((x) => x.username !== this.PROFESSOR_USERNAME)
      .sort((a, b) => a.student.fullName.localeCompare(b.student.fullName));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lista de Estudiantes del G-31');

    worksheet.columns = [
      { header: 'No. de lista', key: 'listNumber', width: 25 },
      { header: 'Nombre Completo', key: 'fullName', width: 35 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Nombre de Usuario', key: 'username', width: 25 },
      { header: 'Nombre Acortado', key: 'shortName', width: 25 },
      { header: 'Convalidado', key: 'recognized', width: 18 },
      { header: 'Arrastre', key: 'carry_forward', width: 18 },
      { header: 'Repitente', key: 'repeater', width: 18 },
      { header: 'Promedio', key: 'average', width: 18 },
    ];

    let totalAverage = 0;
    let studentCount = userDtos.length;

    for (const user of userDtos) {
      const average = await this.gradesService.getAvgByStudentUsername(
        user.username,
      );
      totalAverage += average;

      const row = worksheet.addRow({
        listNumber: user.student.listNumber,
        fullName: user.student.fullName,
        email: user.email,
        username: user.username,
        shortName: user.student.name,
        recognized: user.student.isRecognized ? 'Sí' : 'No',
        carry_forward: user.student.isCarryForward ? 'Sí' : 'No',
        repeater: user.student.isRepeater ? 'Sí' : 'No',
        average: average > 0 ? average.toFixed(2) : '---',
      });

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }

    const averageOfAverages =
      studentCount > 0 && totalAverage > 0
        ? (totalAverage / studentCount).toFixed(2)
        : '---';

    worksheet.addRow([]);

    const aggregationRow = worksheet.addRow([
      'Total de Estudiantes: ',
      studentCount,
      '',
      `Promedio de Promedios: `,
      averageOfAverages,
    ]);

    aggregationRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDDDDDD' },
      };
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    worksheet.autoFilter = {
      from: {
        row: 1,
        column: 1,
      },
      to: {
        row: worksheet.rowCount,
        column: worksheet.columnCount,
      },
    };

    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.alignment = { horizontal: 'center' };
    });

    worksheet.columns.forEach((column) => {
      const maxLength = column.values
        .filter(
          (value) => typeof value === 'string' || typeof value === 'number',
        )
        .reduce(
          (max, value) => Math.max(max as number, value.toString().length),
          0,
        );

      column.width = (maxLength as number) + 8;
    });

    workbook.creator = 'EduardoProfe666';

    return await workbook.xlsx.writeBuffer();
  }

  public async exportGradesTable(username: string) {
    const gradesTable: GradesTableOutDto = await this.getGradesTable(username);

    const documentDefinition =
      await this.createGradesTableDocumentDefinition(gradesTable);
    return new Promise((resolve, reject) => {
      const pdfDoc = (pdfMake as any).createPdf(documentDefinition);
      pdfDoc.getBuffer((buffer) => {
        resolve(buffer);
      });
    });
  }

  private async createGradesTableDocumentDefinition(
    gradeTable: GradesTableOutDto,
  ) {
    const today = new Date().toLocaleDateString('es-ES');
    const grades = await this.gradesService.getByStudentId(
      gradeTable.studentId,
    );
    const name = (await this.studentService.getById(gradeTable.studentId)).name;

    return {
      content: [
        {
          text: 'PW G-31 System',
          alignment: 'right',
          margin: [0, 0, 20, 20],
        },
        {
          text: `Notas de ${name}`,
          style: 'header',
          alignment: 'center',
          bold: true,
          fontSize: 20,
          margin: [0, 0, 0, 20],
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*'],
            body: [
              [
                { text: 'Asignatura', style: 'tableHeader' },
                {
                  text: 'Nota',
                  style: 'tableHeader',
                },
                { text: 'Observaciones', style: 'tableHeader' },
              ],
              ...gradeTable.gradeTable.map((row) => [
                row.assessmentName,
                row.grade || '---',
                grades.find((x) => x.id == row.gradeId)?.professorNote ?? '---',
              ]),
              [
                {
                  text: '',
                  colSpan: 2,
                },
                {},
                {
                  text: `Promedio: ${gradeTable.avg > 0 ? gradeTable.avg.toFixed(2) : '---'}`,
                  style: 'totalRow',
                },
              ],
            ],
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? '#f2f2f2' : null),
            hLineColor: () => '#cccccc',
            vLineColor: () => '#cccccc',
          },
        },
      ],
      footer: (currentPage, pageCount) => {
        return [
          {
            columns: [
              {
                text: ` Fecha: ${today}`,
                alignment: 'left',
              },
              {
                text: `Página ${currentPage} de ${pageCount} `,
                alignment: 'right',
              },
            ],
            margin: [0, 10],
          },
        ];
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true,
        },
        tableHeader: {
          fillColor: '#4CAF50',
          color: '#ffffff',
          fontSize: 12,
          bold: true,
          alignment: 'center',
        },
        totalRow: {
          bold: true,
          fontSize: 12,
        },
      },
      defaultStyle: {
        fontSize: 12,
      },
    };
  }
}
