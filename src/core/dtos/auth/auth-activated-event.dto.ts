import { EventBaseDto, EventBaseDtoKeys } from '../event-base/event-base.dto';

export interface AuthActivatedEventDto extends EventBaseDto {}

export const AuthActivatedEventDtoKeys: (keyof AuthActivatedEventDto)[] = [
  ...EventBaseDtoKeys,
];
