import { Role } from '@core/enums/role.enum';

export interface UserLoggedDto {
  id: string;
  name: string;
  last: string;
  email: string;
  roles: Role[];
}

export const USER_LOGGED_DTO_SYSTEM: UserLoggedDto = {
  id: '0',
  name: 'System',
  last: 'System',
  email: 'email@mail.com',
  roles: [],
};

export const UserLoggedDtoKeys: (keyof UserLoggedDto)[] = [
  'id',
  'name',
  'last',
  'email',
  'roles',
];
