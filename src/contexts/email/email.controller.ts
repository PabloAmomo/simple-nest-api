import { AuthGuard } from '@nestjs/passport';
import { Controller, Get, HttpCode, Req, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { Role } from '@core/enums/role.enum';
import { Roles } from '@core/decorators/roles.decorator';
import { RolesGuard } from '@core/guards/roles.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ApiHealthResponseDto,
  HealthResponseDto,
} from '@core/dtos/health/health-response.dto';
import { ApiEmailTestResponseDto } from '@core/dtos/email/email-test-response.dto';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly mailService: EmailService) {}

  /** Send a test email */
  @Get('/send')
  @ApiOperation({ summary: 'Send a test email' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'email test sent successfully',
    schema: ApiEmailTestResponseDto,
  })
  @ApiUnauthorizedResponse()
  @ApiQuery({
    description: 'email destination for the test',
    name: 'email',
    type: 'string',
  })
  @ApiBadRequestResponse({ description: 'invalid email address' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  send(@Req() req: any) {
    const email = req?.query?.email;
    if (!email) throw new InvalidDataException('invalid email');
    return this.mailService.send(email);
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
    return this.mailService.checkHealth();
  }
}
