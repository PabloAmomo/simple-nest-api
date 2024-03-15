import { ConfigService } from '@nestjs/config';

const configService: ConfigService = new ConfigService();
export const REPO_DATASOURCE = 'user';
export const REPO_DATASOURCE_LOG = 'user-log';
export const REPO_DB = configService.get(
  `${REPO_DATASOURCE.toUpperCase()}_DB_NAME`,
);
