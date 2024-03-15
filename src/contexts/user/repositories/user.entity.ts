import { Role } from '@core/enums/role.enum';
import { BaseEntity } from '@core/entities/base.entity';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  Length,
  MinLength,
} from 'class-validator';
import { Entity, Column, PrimaryColumn } from 'typeorm';
import { REPO_DATASOURCE } from './user.constants';

@Entity({ name: REPO_DATASOURCE })
export class UserEntity extends BaseEntity {
  @PrimaryColumn()
  @MinLength(1)
  id: string;

  @Column({ length: 50, nullable: false })
  @Length(3, 50)
  name: string;

  @Column({ length: 50, nullable: false })
  @Length(3, 50)
  last: string;

  @Column({ length: 100, nullable: false })
  @IsEmail()
  email: string;

  @Column({ length: 255, nullable: false })
  profileImage: string;

  @Column('simple-array')
  @IsArray()
  @ArrayNotEmpty()
  roles: Role[];
}

export const UserEntityKeys: (keyof UserEntity)[] = [
  'id',
  'name',
  'last',
  'email',
  'profileImage',
  'roles',
];
