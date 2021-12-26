import { CacheModule, Global, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from '../service/cache.service';

@Global()
@Module({
    imports: [
        CacheModule.register({
            store: redisStore,
            host: 'localhost',
            port: '6379',
            ttl: 863000,
            password: '123456',
        }),
    ],
    providers: [CacheService],
    exports: [CacheService], // This is IMPORTANT,  you need to export RedisCacheService here so that other modules can use it
})
export class RedisCacheModule {}
