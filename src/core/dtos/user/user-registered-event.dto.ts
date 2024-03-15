import { EventBaseDto, EventBaseDtoKeys } from '../event-base/event-base.dto';
import {
  UserBaseDataEventDto,
  UserBaseDataEventDtoKeys,
} from '../user-base/user-base-data-event.dto';

export interface UserRegisteredEventDto
  extends EventBaseDto,
    UserBaseDataEventDto {
  activationToken: string;
}

export const UserRegisteredEventDtoKeys: (keyof UserRegisteredEventDto)[] = [
  'activationToken',
  ...EventBaseDtoKeys,
  ...UserBaseDataEventDtoKeys,
];
