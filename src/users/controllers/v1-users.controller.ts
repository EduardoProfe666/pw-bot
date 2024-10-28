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
  ApiBadRequestResponse,
  ApiBearerAuth, ApiConflictResponse,
  ApiForbiddenResponse, ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import UsersService from '../services/users.service';
import UserOutDto from '../dto/out/user.out.dto';
import UserWithStudentOutDto from '../dto/out/user-with-student.out.dto';
import UserUpdateInDto from '../dto/in/user-update.in.dto';
import UserInDto from '../dto/in/user.in.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('v1/users')
@ApiTags('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
@ApiUnauthorizedResponse({description: "Unauthorized"})
@ApiForbiddenResponse({description: "Forbidden"})
@UseInterceptors(CacheInterceptor)
export default class V1UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('')
  @ApiOkResponse({description: "Ok", type: [UserOutDto]})
  @ApiOperation({summary: 'Get All Users'})
  async get(){
    return this.service.getAll();
  }

  @Get('/:id')
  @ApiOkResponse({description: "Ok", type: UserWithStudentOutDto})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Get a User by its id'})
  async getById(@Param('id', ParseIntPipe) id: number){
    return this.service.getById(id);
  }

  @Post('')
  @ApiOkResponse({description: "Ok", type: UserOutDto})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiConflictResponse({description: 'Conflict'})
  @ApiOperation({summary: 'Create a new User if does not exist'})
  async post(@Body() dto: UserInDto){
    return this.service.post(dto);
  }

  @Put('/:id')
  @ApiOkResponse({description: "Ok"})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiConflictResponse({description: "Conflict"})
  @ApiOperation({summary: 'Update a User by its id'})
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UserUpdateInDto,
  ){
    return this.service.put(id, dto);
  }

  @Delete('/:id')
  @ApiOkResponse({description: "Ok"})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Delete a User by its id'})
  async delete(@Param('id', ParseIntPipe) id: number){
    return this.service.delete(id);
  }
}