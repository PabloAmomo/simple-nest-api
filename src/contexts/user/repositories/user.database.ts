import getMySqlDatabaseConfig from '@functions/get-mysql-database-config.function';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REPO_DATASOURCE, REPO_DB } from './user.constants';

export const DatabaseUser = {
  name: REPO_DATASOURCE,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) =>
    getMySqlDatabaseConfig(__dirname, REPO_DATASOURCE, REPO_DB, configService),
  inject: [ConfigService],
};
