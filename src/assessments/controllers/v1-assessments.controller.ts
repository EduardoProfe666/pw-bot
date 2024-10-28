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
  ApiConflictResponse, ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import AssessmentsService from '../services/assessments.service';
import AssessmentOutDto from '../dto/out/assessment.out.dto';
import AssessmentInDto from '../dto/in/assessment.in.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('v1/assessments')
@ApiTags('assessments')
@UseInterceptors(CacheInterceptor)
export default class V1AssessmentsController {
  constructor(private readonly service: AssessmentsService) {}

  @Get('')
  @ApiOkResponse({description: "Ok", type: [AssessmentOutDto]})
  @ApiOperation({summary: 'Get All Assessments'})
  async get(){
    return this.service.getAll();
  }

  @Get('/:id')
  @ApiOkResponse({description: "Ok", type: AssessmentOutDto})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Get an Assessment by its id'})
  async getById(@Param('id', ParseIntPipe) id: number){
    return this.service.getById(id);
  }

  @Put('/:id')
  @ApiOkResponse({description: "Ok"})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiConflictResponse({description: "Conflict"})
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({description: "Unauthorized"})
  @ApiForbiddenResponse({description: "Forbidden"})
  @ApiOperation({summary: 'Update an Assessment by its id'})
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssessmentInDto,
  ){
    return this.service.put(id, dto);
  }

  @Post('')
  @ApiOkResponse({description: "Ok", type: AssessmentOutDto})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiConflictResponse({description: 'Conflict'})
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({description: "Unauthorized"})
  @ApiForbiddenResponse({description: "Forbidden"})
  @ApiOperation({summary: 'Create a new Assessment if does not exist'})
  async post(@Body() dto: AssessmentInDto){
    return this.service.post(dto);
  }

  @Delete('/:id')
  @ApiOkResponse({description: "Ok"})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({description: "Unauthorized"})
  @ApiForbiddenResponse({description: "Forbidden"})
  @ApiOperation({summary: 'Delete an Assessment by its id'})
  async delete(@Param('id', ParseIntPipe) id: number){
    return this.service.delete(id);
  }
}
