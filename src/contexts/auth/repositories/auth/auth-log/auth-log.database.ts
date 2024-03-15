import getMySqlDatabaseConfig from '@functions/get-mysql-database-config.function';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REPO_DATASOURCE_LOG, REPO_DB } from '../auth.constants';

export const DatabaseAuthLog = {
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
