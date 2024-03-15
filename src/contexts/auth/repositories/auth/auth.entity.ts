import { BaseEntity } from '@core/entities/base.entity';
import { Length, MinLength } from 'class-validator';
import { Entity, Column, PrimaryColumn } from 'typeorm';
import { REPO_DATASOURCE } from './auth.constants';

@Entity({ name: REPO_DATASOURCE })
export class AuthEntity extends BaseEntity {
  @PrimaryColumn()
  @MinLength(1)
  id: string;

  @Column({ length: 100, nullable: false })
  @Length(8, 100)
  password: string;

  @Column({ default: false })
  activated: boolean;

  @Length(64)
  @Column({ nullable: false, unique: true })
  activationToken: string;
}

export const AuthEntityKeys = [
  'id',
  'password',
  'activated',
  'activationToken',
];
