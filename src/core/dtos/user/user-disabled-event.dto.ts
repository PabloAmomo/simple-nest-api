import { EventBaseDto, EventBaseDtoKeys } from '../event-base/event-base.dto';

export interface UserDisabledEventDto extends EventBaseDto {}

export const UserDisabledEventDtoKeys: (keyof UserDisabledEventDto)[] = [
  ...EventBaseDtoKeys,
];
