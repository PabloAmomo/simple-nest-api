import { EventBaseDto, EventBaseDtoKeys } from '../event-base/event-base.dto';

export interface UserAddedEventDto extends EventBaseDto {
  activationToken: string;
  password: string;
}

export const UserAddedEventDtoKeys: (keyof UserAddedEventDto)[] = [
  'activationToken',
  'password',
  ...EventBaseDtoKeys,
];
