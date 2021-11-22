import {CacheModule, Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import {CacheService} from '../service/cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => ({
        store: redisStore,
        host: 'localhost',
        port: '6379',
        ttl: 863000,
      }),
    }),
  ],
  providers: [CacheService],
  exports: [CacheService] // This is IMPORTANT,  you need to export RedisCacheService here so that other modules can use it
})
export class RedisCacheModule {}
