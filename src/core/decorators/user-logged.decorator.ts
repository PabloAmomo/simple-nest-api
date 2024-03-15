import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserLoggedValue = (
  data: string,
  ctx: ExecutionContext,
): UserLoggedDto | string => {
  const request = ctx.switchToHttp().getRequest();
  // TODO: Verify why userLogged is saved in request.raw.userLogged
  // TODO: userLogged
  const user = request?.userLogged ?? request?.raw?.userLogged ?? {};
  return data ? user?.[data] : user;
};

export const UserLogged = createParamDecorator(UserLoggedValue);
