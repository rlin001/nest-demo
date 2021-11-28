import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AuthModule} from './module/auth.module';
import {ormConfig} from './orm.config';
import {OrderModule} from './module/order.module';
import {RedisCacheModule} from "./module/cache.module";
import {ServeStaticModule} from "@nestjs/serve-static";
import {join} from "path";
// jhipster-needle-add-entity-module-to-main-import - JHipster will import entity modules here, do not remove
// jhipster-needle-add-controller-module-to-main-import - JHipster will import controller modules here, do not remove
// jhipster-needle-add-service-module-to-main-import - JHipster will import service modules here, do not remove

@Module({
    imports: [
        RedisCacheModule,
        TypeOrmModule.forRootAsync({ useFactory: ormConfig }),
        OrderModule,
        AuthModule,
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'public'),
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
