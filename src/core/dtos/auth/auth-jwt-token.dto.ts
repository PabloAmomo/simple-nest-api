export interface AuthJwtTokenDto {
  id: string;
  iat: number;
  exp: number;
}

export const AuthJwtTokenDtoKeys: (keyof AuthJwtTokenDto)[] = [
  'id',
  'iat',
  'exp',
];
