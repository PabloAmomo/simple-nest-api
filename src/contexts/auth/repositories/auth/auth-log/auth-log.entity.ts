import { Entity } from 'typeorm';
import { REPO_DATASOURCE_LOG } from '../auth.constants';
import { LogEntity } from '@core/entities/log.entity';

@Entity({ name: REPO_DATASOURCE_LOG })
export class AuthLogEntity extends LogEntity {}
