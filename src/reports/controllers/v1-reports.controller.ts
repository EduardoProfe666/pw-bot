import { Controller, Get, Param, ParseIntPipe, Post, Request, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse, ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import GradesService from '../../grades/services/grades.service';
import ReportsService from '../services/reports.service';
import { Roles } from '../../auth/decorators/roles.decorator';
import GradeOutDto from '../../grades/dto/out/grade.out.dto';
import RankingTableOutDto from '../dto/out/ranking-table.out.dto';
import AvgGradeOutDto from '../../grades/dto/out/avg-grade.out.dto';
import GradesTableOutDto from '../dto/out/grades-table.out.dto';
import StudentsService from '../../students/services/students.service';

@Controller('v1/reports')
@ApiTags('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({description: "Unauthorized"})
@ApiForbiddenResponse({description: "Forbidden"})
@UseInterceptors(CacheInterceptor)
export default class V1ReportsController{
  constructor(
    private readonly service: ReportsService,
    private readonly studentsService: StudentsService,
  ) {}

  @Post('/studentList/export')
  @Roles('admin', 'student')
  @ApiOkResponse({description: "Ok"})
  @ApiOperation({summary: 'Export students list'})
  async exportStudentList(@Res() res) {
    const excelBuffer = await this.service.exportStudentList();

    res.setHeader('Content-Disposition', 'attachment; filename=lista_estudiantes.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.end(excelBuffer);
  }

  @Post('/rankingTable')
  @Roles('admin', 'student')
  @ApiOkResponse({description: "Ok", type: RankingTableOutDto})
  @ApiOperation({summary: 'Get Ranking Table'})
  async getRankingTable(){
    return this.service.getRankingTable();
  }

  @Post('/rankingTable/export')
  @Roles('admin', 'student')
  @ApiOkResponse({description: "Ok", type: RankingTableOutDto})
  @ApiOperation({summary: 'Export Ranking Table to PDF'})
  async exportRankingTable(@Res() res) {
    const pdfBuffer = await this.service.exportRankingTable();

    res.setHeader('Content-Disposition', 'attachment; filename=ranking_table.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    res.end(pdfBuffer);
  }

  @Get('/gradesTable/:id')
  @Roles('admin')
  @ApiOkResponse({description: "Ok", type: GradesTableOutDto})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Get an students grade Table by its id'})
  async getAvgById(@Param('id', ParseIntPipe) id: number): Promise<GradesTableOutDto>{
    return await this.service.getGradesTable((await this.studentsService.getById(id)).username);
  }

  @Get('/gradesTable/:id/export')
  @Roles('admin')
  @ApiOkResponse({description: "Ok", type: GradesTableOutDto})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Export an students grade Table by its id'})
  async exportAvgById(@Param('id', ParseIntPipe) id: number, @Res() res) {
    const pdfBuffer = await this.service.exportGradesTable((await this.studentsService.getById(id)).username);

    res.setHeader('Content-Disposition', 'attachment; filename=ranking_table.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    res.end(pdfBuffer);
  }

  @Post('/gradesTable/me')
  @Roles('student')
  @ApiOkResponse({description: "Ok", type: GradesTableOutDto})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Get an students grade table by its JWT username'})
  async getGradeTableJwt(@Request() req): Promise<GradesTableOutDto> {
    const username = req.user.username;
    return await this.service.getGradesTable(username);
  }

  @Post('/gradesTable/me/export')
  @Roles('student')
  @ApiOkResponse({description: "Ok", type: GradesTableOutDto})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Export an students grade table by its JWT username'})
  async exportGradeTableJwt(@Request() req, @Res() res) {
    const username = req.user.username;
    const pdfBuffer = await this.service.exportGradesTable(username);

    res.setHeader('Content-Disposition', 'attachment; filename=ranking_table.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    res.end(pdfBuffer);
  }

}