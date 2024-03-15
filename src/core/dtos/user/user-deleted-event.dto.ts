import { EventBaseDto, EventBaseDtoKeys } from '../event-base/event-base.dto';

export interface UserDeletedEventDto extends EventBaseDto {}

export const UserDeletedEventDtoKeys: (keyof UserDeletedEventDto)[] = [
  ...EventBaseDtoKeys,
];
