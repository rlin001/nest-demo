import {Injectable, Inject, CACHE_MANAGER, Logger} from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  logger = new Logger('CacheService');
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
  }

  async set(key: string, value: any) {
    await this.cache.set(key, value)
  }

  async get(key: any): Promise<any> {
    return await this.cache.get(key);
  }



  async handleJWTToken(key:string, value: string, action: string) {
    if (!key || !value) {
      return false;
    }
    const targetValue = await this.get(key);
    this.logger.log("targetValue", targetValue);
    let values = targetValue || [];
    let handleSuccess = false;
    switch (action) {
      case 'add':
      case 'update':
        values.push(value);
        handleSuccess = true;
        await this.set(key, values);
        break;
      case 'find':
        handleSuccess = values.indexOf(value) != -1;
        break;
      case 'delete':
        values.splice(values.indexOf(value),1)
        handleSuccess = true;
        await this.set(key, values);
        break;
    }
    return handleSuccess;
  }

}
