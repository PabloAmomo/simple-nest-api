import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface AuthReqLoginIdDto {
  id: string;
  password: string;
}

export const AuthReqLoginIdDtoKeys: (keyof AuthReqLoginIdDto)[] = [
  'id',
  'password',
];

export const ApiAuthReqLoginIdDto: SchemaObject & Partial<ReferenceObject> = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
  },
};
