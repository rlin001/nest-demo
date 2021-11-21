import { Module } from '@nestjs/common';
import { RedisModule} from 'nestjs-redis'
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './module/auth.module';
import { ormConfig } from './orm.config';
import { CategoryModule } from './module/category.module';
import { TagModule } from './module/tag.module';
import { PetModule } from './module/pet.module';
import { OrderModule } from './module/order.module';
// jhipster-needle-add-entity-module-to-main-import - JHipster will import entity modules here, do not remove
// jhipster-needle-add-controller-module-to-main-import - JHipster will import controller modules here, do not remove
// jhipster-needle-add-service-module-to-main-import - JHipster will import service modules here, do not remove

@Module({
    imports: [
        TypeOrmModule.forRootAsync({ useFactory: ormConfig }),
        AuthModule,
        CategoryModule,
        TagModule,
        PetModule,
        OrderModule,
        RedisModule.register({
          port: 6379,
          host: '127.0.0.1',
          password: '',
          db: 0
        })
      // jhipster-needle-add-entity-module-to-main - JHipster will add entity modules here, do not remove
    ],
    controllers: [
        // jhipster-needle-add-controller-module-to-main - JHipster will add controller modules here, do not remove
    ],
    providers: [
        // jhipster-needle-add-service-module-to-main - JHipster will add service modules here, do not remove
    ],
})
export class AppModule {}
