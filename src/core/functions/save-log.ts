import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import { LogEntity } from '@core/entities/log.entity';
import { Repository } from 'typeorm';

export async function saveLog(
  action: string,
  userLogged: UserLoggedDto,
  detail: object,
  repositoryLog: Repository<any>,
): Promise<void> {
  const user = JSON.stringify(userLogged);
  const createdLogEntity: LogEntity = repositoryLog.create({
    user,
    action,
    detail: JSON.stringify(detail),
  });
  await repositoryLog.save(createdLogEntity);
}
