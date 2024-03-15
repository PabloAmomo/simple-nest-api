import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserEntity } from './user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import { BaseRespository } from '@core/repositories/base.repository';
import { REPO_DATASOURCE, REPO_DATASOURCE_LOG } from './user.constants';
import { saveLog } from '@core/functions/save-log';
import { UserLogEntity } from './user-log/user-log.entity';

@Injectable()
export class UserRepository implements BaseRespository {
  repository: Repository<UserEntity>;
  repositoryLog: Repository<UserLogEntity>;
  REPORT_DATASOURCE: string = REPO_DATASOURCE;

  constructor(
    @InjectRepository(UserEntity, REPO_DATASOURCE)
    repository: Repository<UserEntity>,
    @InjectRepository(UserLogEntity, REPO_DATASOURCE_LOG)
    repositoryLog: Repository<UserLogEntity>,
  ) {
    this.repository = repository;
    this.repositoryLog = repositoryLog;
  }

  async getAllEntities(): Promise<UserEntity[]> {
    return await this.repository.find();
  }

  async getEntityById(id: string): Promise<UserEntity> {
    return await this.repository.findOne({ where: { id } });
  }

  async getEntityByEmail(email: string): Promise<UserEntity> {
    return await this.repository.findOne({ where: { email } });
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
    userEntity: UserEntity,
  ): Promise<void> {
    await saveLog('save', userLogged, userEntity, this.repositoryLog);
    const createdUserEntity = this.repository.create(userEntity);
    await this.repository.save(createdUserEntity);
  }

  async updateEntity(
    userLogged: UserLoggedDto,
    id: string,
    userEntity: UserEntity | Partial<UserEntity>,
  ): Promise<UpdateResult> {
    await saveLog('update', userLogged, userEntity, this.repositoryLog);
    return this.repository.update(id, userEntity);
  }

  async deleteEntity(
    userLogged: UserLoggedDto,
    id: string,
  ): Promise<DeleteResult> {
    await saveLog('delete', userLogged, { id }, this.repositoryLog);
    return await this.repository.delete(id);
  }
}
