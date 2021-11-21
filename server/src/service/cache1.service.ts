import {Global, Injectable} from '@nestjs/common';
import { RedisService } from 'nestjs-redis';

@Global()
@Injectable()
export class CacheService {
  public client;
  constructor(private redisService: RedisService) {
    this.getClient();
  }
  async getClient() {
    this.client = await this.redisService.getClient()
  }

  async set(key:string, value:any, seconds?:number) {
    value = JSON.stringify(value);
    if(!this.client){
      await this.getClient();
    }
    if (!seconds) {
      await this.client.set(key, value);
    } else {
      await this.client.set(key, value, 'EX', seconds);
    }
  }

  async get(key:string) {
    if(!this.client){
      await this.getClient();
    }
    const data = await this.client.get(key);
    if (!data) return;
    return JSON.parse(data);
  }

  async clearCache() {
    if(!this.client){
      await this.getClient();
    }
    this.client.getKeys();
    this.client.getMetadataKeys()
    this.client.re
  }

  async handleJWTToken(key:string, value: string, action: string) {
    if (!key || !value) {
      return false;
    }
    if(!this.client){
      await this.getClient();
    }
    let values = JSON.parse(await this.client.get(key) || '[]');
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
      case 'delete':
        values = values.splice(values.indexOf(value),1)
        handleSuccess = true;
        await this.set(key, values);
        break;
    }
    return handleSuccess;
  }
}
