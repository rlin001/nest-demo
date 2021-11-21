import {Module, CacheModule, Global} from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from '../service/cache.service';

@Global()
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      auth_pass: '',
      db: 1
    }),
  ],
  controllers: [],
  providers: [CacheService],
  exports: [CacheService],
})
export class RedisCacheModule { }
