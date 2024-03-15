import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import { Repository } from 'typeorm';

export interface BaseRespository {
  repository: Repository<any>;
  repositoryLog: Repository<any>;
  REPORT_DATASOURCE: string;

  saveEntity(userLogged: UserLoggedDto, entity: any): any | Promise<void>;
  updateEntity(
    userLogged: UserLoggedDto,
    id: string,
    entity: any | Partial<any>,
  ): any | Promise<any>;
  deleteEntity(userLogged: UserLoggedDto, id: string): any | Promise<any>;
  disableEntity(userLogged: UserLoggedDto, id: string): any | Promise<any>;
  enableEntity(userLogged: UserLoggedDto, id: string): any | Promise<any>;
  getEntityById(id: string): any | Promise<any>;
  getAllEntities(): any | Promise<any>;
}
