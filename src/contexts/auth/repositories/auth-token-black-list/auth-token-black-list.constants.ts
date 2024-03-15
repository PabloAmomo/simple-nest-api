import { ConfigService } from '@nestjs/config';

const configService: ConfigService = new ConfigService();
export const REPO_DATASOURCE = 'auth-token-black-list';
export const REPO_DB = configService.get(
  `${REPO_DATASOURCE.toUpperCase()}_DB_NAME`,
);
