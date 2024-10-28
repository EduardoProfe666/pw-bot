import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe, ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse, ApiBearerAuth,
  ApiConflictResponse, ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import StudentsService from '../services/students.service';
import StudentOutDto from '../dto/out/student.out.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import StudentInDto from '../dto/in/student.in.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('v1/students')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({description: "Unauthorized"})
@ApiForbiddenResponse({description: "Forbidden"})
@ApiTags('students')
@UseInterceptors(CacheInterceptor)
export default class V1StudentsController {
  constructor(private readonly service: StudentsService) {}

  @Get('')
  @Roles('admin', 'student')
  @ApiOkResponse({description: "Ok", type: [StudentOutDto]})
  @ApiOperation({summary: 'Get All Students'})
  async get(){
    return this.service.getAll();
  }

  @Get('/:id')
  @Roles('admin', 'student')
  @ApiOkResponse({description: "Ok", type: StudentOutDto})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Get an Student by its id'})
  async getById(@Param('id', ParseIntPipe) id: number){
    return this.service.getById(id);
  }

  @Put('/:id')
  @Roles('admin')
  @ApiOkResponse({description: "Ok"})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiBearerAuth()
  @ApiOperation({summary: 'Update an Student by its id'})
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StudentInDto,
  ){
    return this.service.put(id, dto);
  }

  @Delete('/:id')
  @Roles('admin')
  @ApiOkResponse({description: "Ok"})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Delete an Student by its id'})
  async delete(@Param('id', ParseIntPipe) id: number){
    return this.service.delete(id);
  }
}
