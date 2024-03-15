import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export enum Role {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

export const ApiRole: SchemaObject & Partial<ReferenceObject> = {
  type: 'string',
  enum: Object.values(Role),
  example: Role.Admin,
};

export const ApiRoleArray: SchemaObject & Partial<ReferenceObject> = {
  type: 'array',
  items: ApiRole,
};
