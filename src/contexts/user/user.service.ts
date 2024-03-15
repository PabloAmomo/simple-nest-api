import { EventEmitter2 } from '@nestjs/event-emitter';
import { HealthResponseDto } from '@core/dtos/health/health-response.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Role } from '@core/enums/role.enum';
import { UserCreatedEvent } from '@core/events/user/user-created.event';
import { UserCreationDto } from '@contexts/user/dtos/user-creation.dto';
import { UserDto } from '@contexts/user/dtos/user.dto';
import { UserEntity } from '@contexts/user/repositories/user.entity';
import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import { UserMapper } from './user.mapper';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import getCheckHealth from '@functions/get-health-response.function';
import { DomainEvents } from '@core/events/domain-events';
import { UserAddedEvent } from '@core/events/user/user-added.event';
import { UserAddedEventDto } from '@core/dtos/user/user-added-event.dto';
import {
  UserDeletedEventDto,
  UserDeletedEventDtoKeys,
} from '@core/dtos/user/user-deleted-event.dto';
import { UserDeletedEvent } from '@core/events/user/user-deleted.event';
import { UserDisabledEvent } from '@core/events/user/user-disabled.event';
import {
  UserEnabledEventDto,
  UserEnabledEventDtoKeys,
} from '@core/dtos/user/user-enabled-event.dto';
import { UserEnabledEvent } from '@core/events/user/user-enabled.event';
import generateRandomToken from '@functions/generate-random-token.function';
import checkInterfaceProperties from '@functions/check-interface-properties.function';
import { UserNotFoundException } from '@contexts/user/exceptions/user-not-found.exception';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private userMapper: UserMapper,
    private eventEmitter: EventEmitter2,
  ) {}

  checkHealth(): HealthResponseDto {
    return getCheckHealth();
  }

  private async changeUserDisabledState(
    userLogged: UserLoggedDto,
    id: string,
    disabled: boolean,
  ) {
    const userToUpdate: UserEntity =
      await this.userRepository.getEntityById(id);
    if (!userToUpdate) throw new UserNotFoundException();

    if (disabled) await this.userRepository.disableEntity(userLogged, id);
    else await this.userRepository.enableEntity(userLogged, id);

    let eventToSend: UserDisabledEvent | UserEnabledEvent;
    const eventIdToSend = disabled
      ? DomainEvents.USER_DISABLED_EVENT
      : DomainEvents.USER_ENABLED_EVENT;
    if (disabled) {
      const userDisabledEventDto: UserDeletedEventDto =
        this.userMapper.userEntityToUserDisabledEventDto(
          userLogged,
          userToUpdate,
        );

      checkInterfaceProperties(
        userDisabledEventDto,
        UserDeletedEventDtoKeys,
        'UserDisabledEventDto',
      );

      eventToSend = new UserDisabledEvent(userLogged, userDisabledEventDto);
    } else {
      const userEnabledEventDto: UserEnabledEventDto =
        this.userMapper.userEntityToUserEnabledEventDto(
          userLogged,
          userToUpdate,
        );

      checkInterfaceProperties(
        userEnabledEventDto,
        UserEnabledEventDtoKeys,
        'UserEnabledEventDto',
      );

      eventToSend = new UserEnabledEvent(userLogged, userEnabledEventDto);
    }
    this.eventEmitter.emit(eventIdToSend, eventToSend);
  }

  async enableUser(userLogged: UserLoggedDto, id: string) {
    await this.changeUserDisabledState(userLogged, id, false);
  }

  async disableUser(userLogged: UserLoggedDto, id: string) {
    await this.changeUserDisabledState(userLogged, id, true);
  }

  async updateUserRoles(userLogged: UserLoggedDto, id: string, roles: Role[]) {
    if (!roles || !Array.isArray(roles) || roles.length === 0)
      throw new InvalidDataException('roles should not be empty');

    const userEntity: UserEntity = await this.userRepository.getEntityById(id);
    if (!userEntity) throw new UserNotFoundException();

    userEntity.roles = roles;
    await this.userRepository.saveEntity(userLogged, userEntity);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAllUsers(userLogged: UserLoggedDto): Promise<UserDto[]> {
    const users: UserEntity[] = await this.userRepository.getAllEntities();
    return users.map(
      (user: UserEntity): UserDto => this.userMapper.userEntityToUserDto(user),
    );
  }

  async findUser(
    userLogged: UserLoggedDto,
    id: string,
  ): Promise<UserDto | null> {
    if (!id) throw new InvalidDataException('invalid id');
    const user: UserEntity = await this.userRepository.getEntityById(id);
    if (!user) throw new UserNotFoundException();
    return this.userMapper.userEntityToUserDto(user);
  }

  async createUser(
    userLogged: UserLoggedDto,
    userCreationDto: UserCreationDto,
  ) {
    const userEntity: UserEntity =
      await this.userMapper.userCreationDtoToUserEntity(userCreationDto);

    const token: string = generateRandomToken(userEntity.id);
    const userAddedEventDto: UserAddedEventDto =
      await this.userMapper.userCreationDtoToUserAddedEventDto(
        userLogged,
        userCreationDto,
        token,
      );
    const userAddedEvent: UserAddedEvent = new UserAddedEvent(
      userLogged,
      userAddedEventDto,
    );

    const userCreatedEventDto = this.userMapper.userEntityToUserCreatedEventDto(
      userLogged,
      userEntity,
      token,
    );
    const userCreatedEvent = new UserCreatedEvent(userCreatedEventDto);

    await this.addUser(userLogged, userEntity);

    this.eventEmitter.emit(DomainEvents.USER_ADDED_EVENT, userAddedEvent);

    this.eventEmitter.emit(DomainEvents.USER_CREATED_EVENT, userCreatedEvent);
  }

  async updateUser(userLogged: UserLoggedDto, id: string, user: UserDto) {
    const userEntity: UserEntity = await this.userRepository.getEntityById(id);

    if (!userEntity) throw new UserNotFoundException();

    const userUpdated = await this.userMapper.UserEntityUpdateFromUserDto(
      userEntity,
      user,
    );
    await this.userRepository.updateEntity(userLogged, id, userUpdated);
  }

  async removeUser(userLogged: UserLoggedDto, id: string) {
    const userToDelete = await this.userRepository.getEntityById(id);
    if (!userToDelete) throw new UserNotFoundException();

    await this.userRepository.deleteEntity(userLogged, id);

    const userDeletedEventDto: UserDeletedEventDto =
      this.userMapper.userEntityToUserDeletedEventDto(userLogged, id);
    const userDeletedEvent: UserDeletedEvent = new UserDeletedEvent(
      userDeletedEventDto,
    );
    this.eventEmitter.emit(DomainEvents.USER_DELETED_EVENT, userDeletedEvent);
  }

  async addUser(userLogged: UserLoggedDto, userEntity: UserEntity) {
    const id: string = userEntity.id;
    const currentUser = await this.userRepository.getEntityById(id);
    if (currentUser)
      throw new HttpException(
        'user already exists',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    await this.userRepository.saveEntity(userLogged, userEntity);
  }
}
