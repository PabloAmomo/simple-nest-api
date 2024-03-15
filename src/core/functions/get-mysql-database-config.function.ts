import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const getMySqlDatabaseConfig = async (
  directory: string,
  envPrefix: string,
  database: string,
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  const prefix: string = envPrefix.toUpperCase();
  const defPwd: string = 'dont_forget_change';
  return {
    type: 'mysql',
    host: configService.get<string>(`${prefix}_DB_HOST`, 'localhost'),
    port: configService.get<number>(`${prefix}_DB_PORT`, 3306),
    username: configService.get<string>(`${prefix}_DB_USER`, 'root'),
    password: configService.get<string>(`${prefix}_DB_PASSWORD`, defPwd),
    database: configService.get<string>(`${prefix}_DB_NAME`, database),
    synchronize: configService.get<boolean>(`${prefix}_DB_SYNCHRONIZE`, true),
    entities: [directory + '/**/*.entity{.ts,.js}'],
  };
};

export default getMySqlDatabaseConfig;
