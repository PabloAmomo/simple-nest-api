import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Put,
  HttpCode,
} from '@nestjs/common';
import { UserService } from '@contexts/user/user.service';
import {
  ApiUserDto,
  ApiUserDtoArray,
  UserDto,
} from '@contexts/user/dtos/user.dto';
import { RolesGuard } from '@core/guards/roles.guard';
import { Roles } from '@core/decorators/roles.decorator';
import { ApiRoleArray, Role } from '@core/enums/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { UserCreationDto } from '@contexts/user/dtos/user-creation.dto';
import { UserMapper } from './user.mapper';
import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import { UserLogged } from '@core/decorators/user-logged.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ApiHealthResponseDto,
  HealthResponseDto,
} from '@core/dtos/health/health-response.dto';
import {
  ApiUserReqUserCreationDto,
  UserReqUserCreationDto,
} from './dtos/user-req-user-creation.dto';
import { ApiUserReqUserDto, UserReqUserDto } from './dtos/user-req-user.dto';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private userMapper: UserMapper,
  ) {}

  /** Health check */
  @Get('/health')
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({
    description: 'health check',
    schema: ApiHealthResponseDto,
  })
  @HttpCode(200)
  checkHealth(): HealthResponseDto {
    return this.userService.checkHealth();
  }

  /** Create user */
  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create user' })
  @ApiBadRequestResponse({ description: 'invalid data' })
  @ApiOkResponse({ description: 'user created' })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiBody({ schema: ApiUserReqUserCreationDto })
  @ApiInternalServerErrorResponse({ description: 'user already exists' })
  async createUser(
    @Body() user: UserReqUserCreationDto,
    @UserLogged() userLogged: UserLoggedDto,
  ): Promise<void> {
    const UserCreationDto: UserCreationDto =
      this.userMapper.reqUserToUserCreationDto(user);
    return this.userService.createUser(userLogged, UserCreationDto);
  }

  /** Get all users */
  @Get('/all')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get all users' })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiOkResponse({ schema: ApiUserDtoArray })
  getAllUsers(@UserLogged() userLogged: UserLoggedDto): Promise<UserDto[]> {
    return this.userService.getAllUsers(userLogged);
  }

  /** Update user */
  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update user' })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiNotFoundResponse({ description: 'user not found' })
  @ApiOkResponse({ schema: ApiUserDto })
  @ApiBody({ schema: ApiUserReqUserDto })
  updateUser(
    @UserLogged() userLogged: UserLoggedDto,
    @Param('id') id: string,
    @Body() user: UserReqUserDto,
  ): Promise<void> {
    if (!id) throw new InvalidDataException('invalid id');
    const userDto: UserDto = this.userMapper.reqUserToUserDto(user);
    return this.userService.updateUser(userLogged, id, userDto);
  }

  /** Find user */
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Find user' })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiNotFoundResponse({ description: 'user not found' })
  @ApiBadRequestResponse({ description: 'invalid data' })
  @ApiOkResponse({ schema: ApiUserDto })
  findUser(
    @UserLogged() userLogged: UserLoggedDto,
    @Param('id') id: string,
  ): Promise<UserDto> {
    if (!id) throw new InvalidDataException('invalid id');
    return this.userService.findUser(userLogged, id);
  }

  /** Remove user */
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Remove user' })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiOkResponse({ description: 'user removed' })
  @ApiNotFoundResponse({ description: 'user not found' })
  @ApiBadRequestResponse({ description: 'invalid data' })
  removeUser(
    @UserLogged() userLogged: UserLoggedDto,
    @Param('id') id: string,
  ): Promise<void> {
    if (!id) throw new InvalidDataException('invalid id');
    return this.userService.removeUser(userLogged, id);
  }

  /** Update user roles */
  @Put(':id/roles')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update user roles' })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiOkResponse({ description: 'user roles updated' })
  @ApiNotFoundResponse({ description: 'user not found' })
  @ApiBadRequestResponse({ description: 'invalid data' })
  @ApiBody({
    schema: ApiRoleArray,
  })
  @ApiBody({
    schema: ApiRoleArray,
  })
  updateUserRoles(
    @UserLogged() userLogged: UserLoggedDto,
    @Param('id') id: string,
    @Body() roles: Role[] | string[],
  ): Promise<void> {
    if (!id) throw new InvalidDataException('invalid id');
    const rolesArray: Role[] = this.userMapper.reqRolesToRolesArray(roles);
    return this.userService.updateUserRoles(userLogged, id, rolesArray);
  }

  /** Enable user */
  @Put(':id/enable')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Enable user' })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiOkResponse({ description: 'user enabled' })
  @ApiNotFoundResponse({ description: 'user not found' })
  @ApiBadRequestResponse({ description: 'invalid data' })
  enableUser(
    @UserLogged() userLogged: UserLoggedDto,
    @Param('id') id: string,
  ): Promise<void> {
    if (!id) throw new InvalidDataException('invalid id');
    return this.userService.enableUser(userLogged, id);
  }

  /** Disable user */
  @Put(':id/disable')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Disable user' })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiOkResponse({ description: 'user disabled' })
  @ApiNotFoundResponse({ description: 'user not found' })
  @ApiBadRequestResponse({ description: 'invalid data' })
  disableUser(
    @UserLogged() userLogged: UserLoggedDto,
    @Param('id') id: string,
  ): Promise<void> {
    if (!id) throw new InvalidDataException('invalid id');
    return this.userService.disableUser(userLogged, id);
  }
}
