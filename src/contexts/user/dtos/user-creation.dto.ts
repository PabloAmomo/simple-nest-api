import { Role } from '@core/enums/role.enum';

export interface UserCreationDto {
  id: string;
  name: string;
  last: string;
  email: string;
  roles: Role[];
  password: string;
}

export const UserCreationDtoKeys: (keyof UserCreationDto)[] = [
  'id',
  'name',
  'last',
  'email',
  'roles',
  'password',
];
