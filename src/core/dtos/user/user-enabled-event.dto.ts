import { EventBaseDto, EventBaseDtoKeys } from '../event-base/event-base.dto';

export interface UserEnabledEventDto extends EventBaseDto {}

export const UserEnabledEventDtoKeys: (keyof UserEnabledEventDto)[] = [
  ...EventBaseDtoKeys,
];
