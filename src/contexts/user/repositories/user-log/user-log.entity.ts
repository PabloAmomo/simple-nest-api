import { Entity } from 'typeorm';
import { REPO_DATASOURCE_LOG } from '../user.constants';
import { LogEntity } from '@core/entities/log.entity';

@Entity({ name: REPO_DATASOURCE_LOG })
export class UserLogEntity extends LogEntity {}
