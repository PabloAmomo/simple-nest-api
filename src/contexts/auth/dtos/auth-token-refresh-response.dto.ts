import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface AuthTokenRefreshResponseDto {
  token: string;
}

export const ApiAuthTokenRefreshResponseDto: SchemaObject &
  Partial<ReferenceObject> = {
  type: 'object',
  properties: {
    token: {
      type: 'string',
    },
  },
};
