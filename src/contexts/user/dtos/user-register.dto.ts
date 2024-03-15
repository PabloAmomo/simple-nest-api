export interface UserRegisterDto {
  id: string;
  name: string;
  last: string;
  email: string;
  password: string;
}

export const UserRegisterDtoKeys: (keyof UserRegisterDto)[] = [
  'id',
  'name',
  'last',
  'email',
  'password',
];
