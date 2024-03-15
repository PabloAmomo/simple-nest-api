import getMySqlDatabaseConfig from '@functions/get-mysql-database-config.function';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REPO_DB, REPO_DATASOURCE } from './auth.constants';

export const DatabaseAuth = {
  name: REPO_DATASOURCE,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) =>
    getMySqlDatabaseConfig(__dirname, REPO_DATASOURCE, REPO_DB, configService),
  inject: [ConfigService],
};
