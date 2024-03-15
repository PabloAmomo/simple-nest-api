import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  HttpCode,
  Param,
  Body,
  Query,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  ApiAuthLoginResponseDto,
  AuthLoginResponseDto,
} from '@contexts/auth/dtos/auth-login-response.dto';
import { UserDto, UserDtoKeys } from '@contexts/user/dtos/user.dto';
import {
  ApiAuthReqValidationTokenDto,
  AuthReqValidationTokenDto,
  AuthReqValidationTokenDtoKeys,
} from './dtos/auth-req-validation-token.dto';
import { UserLogged } from '@core/decorators/user-logged.decorator';
import checkInterfaceProperties from '@functions/check-interface-properties.function';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ApiHealthResponseDto,
  HealthResponseDto,
} from '@core/dtos/health/health-response.dto';
import { ApiAuthReqLoginIdDto } from './dtos/auth-req-login-id.dto';
import { ApiAuthReqChangePasswordDto } from './dtos/auth-req-change-password.dto';
import { ApiUserNotFoundException } from '@contexts/user/exceptions/user-not-found.exception';
import {
  ApiAuthTokenRefreshResponseDto,
  AuthTokenRefreshResponseDto,
} from './dtos/auth-token-refresh-response.dto';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';
import { ApiAuthReqLoginEmailDto } from './dtos/auth-req-login-email.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /** Health check */
  @Get('/health')
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({
    description: 'health check',
    schema: ApiHealthResponseDto,
  })
  @HttpCode(200)
  checkHealth(): HealthResponseDto {
    return this.authService.checkHealth();
  }

  /** Token Refresh */
  @Get('/token/refresh')
  @ApiOperation({ summary: 'Refresh user token' })
  @ApiQuery({ name: 'token', required: true, type: 'string' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'token refreshed',
    schema: ApiAuthTokenRefreshResponseDto,
  })
  @ApiBadRequestResponse({ description: 'invalid token' })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @UseGuards(AuthGuard('jwt-refresh'))
  tokenRefresh(
    @Request() req: any,
    @Query('token') token: string,
  ): Promise<AuthTokenRefreshResponseDto> {
    const id: string = req?.user?.id ?? '';
    if (!id) throw new UnauthorizedException('invalid user id');
    if (!token) throw new InvalidDataException('invalid token');
    return this.authService.tokenRefresh(id, token);
  }

  /** Login (By Id) */
  @Post('login')
  @ApiOperation({ summary: 'Login user by id and password' })
  @ApiBody({
    description: 'validate user by id and password',
    schema: ApiAuthReqLoginIdDto,
  })
  @ApiOkResponse({
    description: 'user logged',
    schema: ApiAuthLoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'invalid credentials',
  })
  @UseGuards(AuthGuard(['local-id']))
  loginId(@Request() req: any): AuthLoginResponseDto {
    const user: UserDto = req.user;
    checkInterfaceProperties(user, UserDtoKeys, 'UserDto');
    return this.authService.login(user);
  }

  /** Login (By Email) */
  @Post('login/email')
  @ApiOperation({ summary: 'Login user by email and password' })
  @ApiBody({
    description: 'validate user by email and password',
    schema: ApiAuthReqLoginEmailDto,
  })
  @ApiOkResponse({
    description: 'user logged',
    schema: ApiAuthLoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'invalid credentials',
  })
  @UseGuards(AuthGuard(['local-email']))
  loginEmail(@Request() req: any): AuthLoginResponseDto {
    const user: UserDto = req.user;
    checkInterfaceProperties(user, UserDtoKeys, 'UserDto');
    return this.authService.login(user);
  }

  /** Logout */
  @Get('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiBearerAuth('jwt')
  @ApiQuery({ name: 'refreshToken', required: true, type: 'string' })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiBadRequestResponse({ description: 'invalid refresh token' })
  @ApiResponse(ApiUserNotFoundException)
  @ApiOkResponse()
  @UseGuards(AuthGuard('jwt'))
  async logout(
    @Request() req: any,
    @Query('refreshToken') refreshToken: string,
  ): Promise<void> {
    const authHeader = req?.headers?.authorization ?? '';
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) throw new UnauthorizedException('invalid token');
    if (!refreshToken) throw new InvalidDataException('invalid refresh token');

    await this.authService.logout(token, refreshToken);
    return null;
  }

  /** Change Password */
  @Put('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiBearerAuth('jwt')
  @ApiBody({
    description: 'change Password',
    schema: ApiAuthReqChangePasswordDto,
  })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiResponse(ApiUserNotFoundException)
  @ApiOkResponse()
  @UseGuards(AuthGuard('jwt'))
  changePassword(
    @UserLogged('id') id: string,
    @Body('password') password: string,
  ): Promise<void> {
    if (!password) throw new InvalidDataException('invalid password');
    if (!id) throw new InvalidDataException('invalid user id');
    return this.authService.changePassword(id, password);
  }

  /** Activate User (By query string) */
  @Get('/:id/activate')
  @ApiOperation({ summary: 'Activate user by id' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'user id to activate',
    type: 'string',
  })
  @ApiQuery({
    description: 'activation token',
    name: 'activationToken',
    type: 'string',
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse({
    description: 'invalid activation token',
  })
  @ApiResponse(ApiUserNotFoundException)
  activateUserByGet(
    @Param('id') id: string,
    @Query() authReqValidationTokenDto: AuthReqValidationTokenDto,
  ): Promise<void> {
    checkInterfaceProperties(
      authReqValidationTokenDto,
      AuthReqValidationTokenDtoKeys,
      'AuthReqValidationTokenDto',
    );
    return this.authService.activate(
      id,
      authReqValidationTokenDto.activationToken,
    );
  }

  /** Activate User */
  @Put('/:id/activate')
  @ApiOperation({ summary: 'Activate user by id' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'user id to activate',
    type: 'string',
  })
  @ApiBody({
    description: 'Validation token',
    schema: ApiAuthReqValidationTokenDto,
  })
  @ApiUnauthorizedResponse({
    description: 'invalid activation token',
  })
  @ApiResponse(ApiUserNotFoundException)
  activateUserByPut(
    @Param('id') id: string,
    @Body() authReqValidationTokenDto: AuthReqValidationTokenDto,
  ): Promise<void> {
    checkInterfaceProperties(
      authReqValidationTokenDto,
      AuthReqValidationTokenDtoKeys,
      'AuthReqValidationTokenDto',
    );
    return this.authService.activate(
      id,
      authReqValidationTokenDto.activationToken,
    );
  }
}
