import getMySqlDatabaseConfig from '@functions/get-mysql-database-config.function';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REPO_DATASOURCE_LOG, REPO_DB } from '../user.constants';

export const DatabaseUserLog = {
  name: REPO_DATASOURCE_LOG,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) =>
    getMySqlDatabaseConfig(
      __dirname,
      REPO_DATASOURCE_LOG,
      REPO_DB,
      configService,
    ),
  inject: [ConfigService],
};
