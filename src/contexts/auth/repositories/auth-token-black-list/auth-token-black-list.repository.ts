import { Repository } from 'typeorm';
import { AuthTokenBlackListEntity } from './auth-token-black-list.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { REPO_DATASOURCE } from './auth-token-black-list.constants';

@Injectable()
export class AuthTokenBlackListRepository {
  repository: Repository<AuthTokenBlackListEntity>;
  constructor(
    @InjectRepository(AuthTokenBlackListEntity, REPO_DATASOURCE)
    repository: Repository<AuthTokenBlackListEntity>,
  ) {
    this.repository = repository;
  }

  async getEntityByToken(token: string): Promise<AuthTokenBlackListEntity> {
    if (!token) return null;
    return await this.repository.findOne({ where: { token } });
  }

  async saveEntity(
    authTokenBlackListEntity: AuthTokenBlackListEntity,
  ): Promise<void> {
    const authTokenBlackListEntityFound = await this.getEntityByToken(
      authTokenBlackListEntity.token,
    );

    if (authTokenBlackListEntityFound) return;
    const createAuthTokenBlackListCreated = this.repository.create(
      authTokenBlackListEntity,
    );
    await this.repository.save(createAuthTokenBlackListCreated);
  }
}
