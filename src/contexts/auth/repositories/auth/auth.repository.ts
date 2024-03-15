import { Repository, UpdateResult } from 'typeorm';
import { AuthEntity } from './auth.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import { BaseRespository } from '@core/repositories/base.repository';
import { REPO_DATASOURCE, REPO_DATASOURCE_LOG } from './auth.constants';
import { saveLog } from '@core/functions/save-log';
import { AuthLogEntity } from './auth-log/auth-log.entity';

@Injectable()
export class AuthRepository implements BaseRespository {
  repository: Repository<AuthEntity>;
  repositoryLog: Repository<AuthLogEntity>;
  REPORT_DATASOURCE: string = REPO_DATASOURCE;

  constructor(
    @InjectRepository(AuthEntity, REPO_DATASOURCE)
    repository: Repository<AuthEntity>,

    @InjectRepository(AuthLogEntity, REPO_DATASOURCE_LOG)
    repositoryLog: Repository<AuthLogEntity>,
  ) {
    this.repository = repository;
    this.repositoryLog = repositoryLog;
  }

  async getAllEntities(): Promise<AuthEntity[]> {
    return await this.repository.find();
  }

  async getEntityById(id: string): Promise<AuthEntity> {
    return await this.repository.findOne({ where: { id } });
  }

  async changeDisabledState(
    userLogged: UserLoggedDto,
    id: string,
    disabled: boolean,
  ): Promise<UpdateResult> {
    await saveLog(
      'update',
      userLogged,
      {
        id,
        disabled,
      },
      this.repositoryLog,
    );
    return await this.repository.update(id, { disabled });
  }

  async disableEntity(
    userLogged: UserLoggedDto,
    id: string,
  ): Promise<UpdateResult> {
    return await this.changeDisabledState(userLogged, id, true);
  }

  async enableEntity(
    userLogged: UserLoggedDto,
    id: string,
  ): Promise<UpdateResult> {
    return await this.changeDisabledState(userLogged, id, false);
  }

  async saveEntity(
    userLogged: UserLoggedDto,
    authEntity: AuthEntity,
  ): Promise<void> {
    saveLog('save', userLogged, authEntity, this.repositoryLog);
    const createdAuthEntity = this.repository.create(authEntity);
    await this.repository.save(createdAuthEntity);
  }

  async updateEntity(
    userLogged: UserLoggedDto,
    id: string,
    authEntity: AuthEntity | Partial<AuthEntity>,
  ): Promise<UpdateResult> {
    saveLog('update', userLogged, authEntity, this.repositoryLog);
    return this.repository.update(id, authEntity);
  }

  async deleteEntity(userLogged: UserLoggedDto, id: string): Promise<void> {
    saveLog('delete', userLogged, { id }, this.repositoryLog);
    await this.repository.delete(id);
  }
}
