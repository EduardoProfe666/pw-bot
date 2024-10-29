import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse, ApiBearerAuth,
  ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import GradesService from '../services/grades.service';
import GradeOutDto from '../dto/out/grade.out.dto';
import GradeWithAssessmentOutDto from '../dto/out/grade-with-assessment.out.dto';
import GradeInDto from '../dto/in/grade.in.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('v1/grades')
@ApiTags('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({description: "Unauthorized"})
@ApiForbiddenResponse({description: "Forbidden"})
@UseInterceptors(CacheInterceptor)
export default class V1GradesController {
  constructor(private readonly service: GradesService) {}

  @Get('')
  @Roles('admin')
  @ApiOkResponse({description: "Ok", type: [GradeOutDto]})
  @ApiOperation({summary: 'Get All Grades'})
  async get(){
    return this.service.getAll();
  }

  @Get('/:id')
  @Roles('admin')
  @ApiOkResponse({description: "Ok", type: GradeWithAssessmentOutDto})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Get a Grade with Assessment by its id'})
  async getById(@Param('id', ParseIntPipe) id: number){
    return this.service.getById(id);
  }

  @Get('/student/:id')
  @Roles('admin')
  @ApiOkResponse({type: [GradeWithAssessmentOutDto]})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Get a list of Grades with Assessments of an Student by its id'})
  async getByStudentId(@Param('id', ParseIntPipe) id: number){
    return this.service.getByStudentId(id);
  }

  @Put('/:id')
  @Roles('admin')
  @ApiOkResponse({description: "Ok"})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiConflictResponse({description: "Conflict"})
  @ApiOperation({summary: 'Update a Grade by its id'})
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GradeInDto,
  ){
    return this.service.put(id, dto);
  }

  @Post('')
  @Roles('admin')
  @ApiCreatedResponse({description: "Created", type: GradeWithAssessmentOutDto})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiConflictResponse({description: "Conflict"})
  @ApiOperation({summary: 'Create a new Grade if does not exist'})
  async post(@Body() dto: GradeInDto){
    return this.service.post(dto);
  }

  @Delete('/:id')
  @Roles('admin')
  @ApiOkResponse({description: "Ok"})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Delete a Grade by its id'})
  async delete(@Param('id', ParseIntPipe) id: number){
    return this.service.delete(id);
  }
}
