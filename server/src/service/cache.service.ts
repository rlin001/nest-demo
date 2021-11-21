import {Injectable, Inject, CACHE_MANAGER, Logger} from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  logger = new Logger('CacheService');
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {
  }

  cacheSet(key: string, value: any, ttl?: number) {
    this.cacheManager.set(key, value, { ttl: ttl }, (err: any) => {
      if (err) {
        throw err;
      }
    })
  }

  async cacheGet(key: any): Promise<any> {
    return this.cacheManager.get(key);
  }



  async handleJWTToken(key:string, value: string, action: string) {
    if (!key || !value) {
      return false;
    }
    const targetValue = await this.cacheGet(key);
    this.logger.log("targetValue", targetValue);
    let values = JSON.parse(targetValue || '[]');
    let handleSuccess = false;
    switch (action) {
      case 'add':
      case 'update':
        values.push(value);
        handleSuccess = true;
        this.cacheSet(key, values);
        break;
      case 'find':
        handleSuccess = values.indexOf(value) != -1;
        break;
      case 'delete':
        values = values.splice(values.indexOf(value),1)
        handleSuccess = true;
        this.cacheSet(key, values);
        break;
    }
    return handleSuccess;
  }

}
