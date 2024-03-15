import { Role } from '@core/enums/role.enum';

export interface UserBaseDataEventDto {
  name: string;
  last: string;
  email: string;
  roles: Role[];
}

export const UserBaseDataEventDtoKeys: (keyof UserBaseDataEventDto)[] = [
  'name',
  'last',
  'email',
  'roles',
];
