import { EventEmitter2 } from '@nestjs/event-emitter';
import { HealthResponseDto } from '@core/dtos/health/health-response.dto';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '@contexts/user/repositories/user.entity';
import getCheckHealth from '@functions/get-health-response.function';
import { DomainEvents } from '@core/events/domain-events';
import { UserRegisteredEvent } from '@core/events/user/user-registered.event';
import { UserMapper } from '../user.mapper';
import { UserRegisterDto } from '../dtos/user-register.dto';
import { UserService } from '../user.service';
import { UserAddedEvent } from '@core/events/user/user-added.event';
import { UserAddedEventDto } from '@core/dtos/user/user-added-event.dto';
import generateRandomToken from '@functions/generate-random-token.function';
import {
  USER_LOGGED_DTO_SYSTEM,
  UserLoggedDto,
} from '@core/dtos/user/user-logged.dto';

@Injectable()
export class UserRegisterService {
  constructor(
    private readonly userService: UserService,
    private userMapper: UserMapper,
    private eventEmitter: EventEmitter2,
  ) {}

  checkHealth(): HealthResponseDto {
    return getCheckHealth();
  }

  async registerUser(
    userLogged: UserLoggedDto,
    userRegisterDto: UserRegisterDto,
  ) {
    const userLoggedDto: UserLoggedDto = userLogged ?? {
      ...USER_LOGGED_DTO_SYSTEM,
    };

    const userEntity: UserEntity =
      await this.userMapper.userRegisterDtoToUserEntity(userRegisterDto);

    const token = generateRandomToken(userEntity.id);

    const userAddedEventDto: UserAddedEventDto =
      await this.userMapper.userRegisterDtoToUserAddedEventDto(
        userLoggedDto,
        userRegisterDto,
        token,
      );
    const userAddedEvent: UserAddedEvent = new UserAddedEvent(
      userLoggedDto,
      userAddedEventDto,
    );

    const UserRegisteredEventDto =
      this.userMapper.userEntityToUserRegisteredEventDto(
        userLoggedDto,
        userEntity,
        token,
      );
    const userRegisteredEvent = new UserRegisteredEvent(UserRegisteredEventDto);

    await this.userService.addUser(userLoggedDto, userEntity);

    this.eventEmitter.emit(DomainEvents.USER_ADDED_EVENT, userAddedEvent);
    this.eventEmitter.emit(
      DomainEvents.USER_REGISTERED_EVENT,
      userRegisteredEvent,
    );
  }
}
