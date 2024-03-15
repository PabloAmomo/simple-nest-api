import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEvents } from '@core/events/domain-events';
import { AuthEntity } from '@contexts/auth/repositories/auth/auth.entity';
import { AuthMapper } from './auth.mapper';
import { UserAddedEvent } from '@core/events/user/user-added.event';
import { AuthService } from './auth.service';
import { UserDeletedEvent } from '@core/events/user/user-deleted.event';
import { UserEnabledEvent } from '@core/events/user/user-enabled.event';

@Injectable()
export class AuthListener {
  private readonly logger = new Logger('AuthListener');
  constructor(
    private authMapper: AuthMapper,
    private readonly authService: AuthService,
  ) {}

  @OnEvent(DomainEvents.USER_ADDED_EVENT)
  async handleUserAddedEvent(event: UserAddedEvent) {
    const authEntity: AuthEntity =
      await this.authMapper.userAddedEventToAuthEntity(event);
    await this.authService.createUser(event.userLogged, authEntity);
  }

  @OnEvent(DomainEvents.USER_DELETED_EVENT)
  async handleUserDeletedEvent(event: UserDeletedEvent) {
    await this.authService.deleteUser(event.userLogged, event.id);
  }

  @OnEvent(DomainEvents.USER_ENABLED_EVENT)
  async handleUserEnabledEvent(event: UserEnabledEvent) {
    await this.authService.enableUser(event.userLogged, event.id);
  }

  @OnEvent(DomainEvents.USER_DISABLED_EVENT)
  async handleUserDisabledEvent(event: UserEnabledEvent) {
    await this.authService.disableUser(event.userLogged, event.id);
  }
}
