import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { UserMapper } from '../user.mapper';
import { UserRegisterDto } from '../dtos/user-register.dto';
import { UserRegisterService } from './user.register.service';
import {
  UserLoggedDto,
  USER_LOGGED_DTO_SYSTEM,
} from '@core/dtos/user/user-logged.dto';
import { UserLogged } from '@core/decorators/user-logged.decorator';
import {
  ApiUserReqUserRegisterDto,
  UserReqUserRegisterDto,
} from '../dtos/user-req-user-register.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiHealthResponseDto,
  HealthResponseDto,
} from '@core/dtos/health/health-response.dto';

@ApiTags('user/register')
@Controller('user/register')
export class UserRegisterController {
  constructor(
    private userRegisterService: UserRegisterService,
    private userMapper: UserMapper,
  ) {}

  /** Register a new user */
  @Post()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiOkResponse({ description: 'User registered' })
  @ApiBody({ schema: ApiUserReqUserRegisterDto })
  @ApiBadRequestResponse({ description: 'invalid data' })
  registerUser(
    @UserLogged() userLogged: UserLoggedDto,
    @Body() userReqUserRegisterDto: UserReqUserRegisterDto,
  ): Promise<void> {
    const registerUserDto: UserRegisterDto =
      this.userMapper.userReqRegisterUserToRegisterUserDto(
        userReqUserRegisterDto,
      );

    // Empty logged user for anonymous registration
    if (!userLogged || !userLogged?.id)
      userLogged = { ...USER_LOGGED_DTO_SYSTEM };

    return this.userRegisterService.registerUser(userLogged, registerUserDto);
  }

  /** Health check */
  @Get('/health')
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({
    description: 'health check',
    schema: ApiHealthResponseDto,
  })
  @HttpCode(200)
  checkHealth(): HealthResponseDto {
    return this.userRegisterService.checkHealth();
  }
}
