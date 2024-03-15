import { MinLength } from 'class-validator';
import { Entity, PrimaryColumn } from 'typeorm';
import { REPO_DATASOURCE } from './auth-token-black-list.constants';
import { BaseEntity } from '@core/entities/base.entity';

@Entity({ name: REPO_DATASOURCE })
export class AuthTokenBlackListEntity extends BaseEntity {
  @PrimaryColumn({ length: 200, nullable: false })
  @MinLength(1)
  token: string;
}

export const AuthTokenBlackListKeys = ['token'];
