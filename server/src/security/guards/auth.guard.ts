import {CanActivate, ExecutionContext, Inject, Injectable, Logger} from '@nestjs/common';
import {AuthGuard as NestAuthGuard} from '@nestjs/passport';
import {CacheService} from "../../service/cache.service";

@Injectable()
export class AuthGuard extends NestAuthGuard('jwt') implements CanActivate {
    logger = new Logger('authGuard');

    constructor(@Inject('CacheService') private readonly cacheService) {
      super();
    }

    async canActivate(context: ExecutionContext): Promise<any> {
      const request = context.switchToHttp().getRequest();
      const existAuthToken = await this.cacheService.handleJWTToken("authorization", request.headers['authorization'], 'find');
      this.logger.log("AuthGuard existAuthToken:", existAuthToken)
      if (existAuthToken) {
        return super.canActivate(context);
      }
      return existAuthToken
    }
}
