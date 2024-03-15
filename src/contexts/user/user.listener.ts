import { AuthActivatedEvent } from '@core/events/auth/auth-activated.event';
import { DomainEvents } from '@core/events/domain-events';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import { UserActivatedEvent } from '@core/events/user/user-activated.event';
import { UserMapper } from './user.mapper';
import { UserService } from './user.service';
import { UserDto } from './dtos/user.dto';

@Injectable()
export class UserListener {
  private readonly logger = new Logger('UserListener');
  constructor(
    private readonly userService: UserService,
    private readonly userMapper: UserMapper,
    private readonly emitter: EventEmitter2,
  ) {}

  @OnEvent(DomainEvents.AUTH_ACTIVATED_EVENT)
  async handleAuthActivatedEvent(event: AuthActivatedEvent) {
    const userActivated: UserDto = await this.userService.findUser(
      event.userLogged,
      event.id,
    );
    const userActivatedEventDto =
      this.userMapper.userDtoToUserActivatedEventDto(
        event.userLogged,
        userActivated,
      );
    const userActivationEvent = new UserActivatedEvent(userActivatedEventDto);
    this.emitter.emit(DomainEvents.USER_ACTIVATED_EVENT, userActivationEvent);
  }
}
