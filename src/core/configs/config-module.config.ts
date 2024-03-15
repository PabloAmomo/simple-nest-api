import { ConfigModuleOptions } from '@nestjs/config';

const ConfigModuleConfig: ConfigModuleOptions = { isGlobal: true, cache: true };

export default ConfigModuleConfig;
