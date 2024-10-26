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
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import StudentsService from '../services/students.service';
import StudentOutDto from '../dto/out/student.out.dto';
import StudentWithGradesOutDto from '../dto/out/student-with-grades.out.dto';
import StudentInDto from '../dto/in/student.in.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('v1/students')
@ApiTags('students')
@UseInterceptors(CacheInterceptor)
export default class V1StudentsController {
  constructor(private readonly service: StudentsService) {}

  @Get('')
  @ApiOkResponse({description: "Ok", type: [StudentOutDto]})
  @ApiOperation({summary: 'Get All Students'})
  async get(){
    return this.service.getAll();
  }

  @Get('/:id')
  @ApiOkResponse({description: "Ok", type: StudentWithGradesOutDto})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Get an Student with grades by its id'})
  async getById(@Param('id', ParseIntPipe) id: number){
    return this.service.getById(id);
  }

  @Put('/:id')
  @ApiOkResponse({description: "Ok"})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiConflictResponse({description: "Conflict"})
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({description: "Unauthorized"})
  @ApiOperation({summary: 'Update an Student by its id'})
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StudentInDto,
  ){
    return this.service.put(id, dto);
  }

  @Post('')
  @ApiOkResponse({description: "Ok", type: StudentOutDto})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiConflictResponse({description: "Conflict"})
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({description: "Unauthorized"})
  @ApiOperation({summary: 'Create a new Student if does not exist'})
  async post(@Body() dto: StudentInDto){
    return this.service.post(dto);
  }

  @Delete('/:id')
  @ApiOkResponse({description: "Ok"})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({description: "Unauthorized"})
  @ApiOperation({summary: 'Delete an Student by its id'})
  async delete(@Param('id', ParseIntPipe) id: number){
    return this.service.delete(id);
  }
}
