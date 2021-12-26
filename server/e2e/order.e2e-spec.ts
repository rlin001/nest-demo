import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { AuthGuard } from '../src/security';
import { RolesGuard } from '../src/security';
import { OrderDTO } from '../src/service/dto/order.dto';
import { OrderService } from '../src/service/order.service';

describe('Order Controller', () => {
    let app: INestApplication;

    const authGuardMock = { canActivate: (): any => true };
    const rolesGuardMock = { canActivate: (): any => true };
    const entityMock: any = {
        id: 'entityId',
        quantity: 2,
    };

    const serviceMock = {
        findById: (): any => entityMock,
        save: (): any => entityMock,
        deleteById: (): any => entityMock,
        findAllOrderAndPet: (): any => [[entityMock], [entityMock]],
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideGuard(AuthGuard)
            .useValue(authGuardMock)
            .overrideGuard(RolesGuard)
            .useValue(rolesGuardMock)
            .overrideProvider(OrderService)
            .useValue(serviceMock)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/GET orders by id', async () => {
        const getEntity: OrderDTO = (
            await request(app.getHttpServer())
                .get('/store/order/' + entityMock.id)
                .expect(200)
        ).body;
        expect(getEntity).toEqual(entityMock);
    });

    it('/POST create orders', async () => {
        const createdEntity: OrderDTO = (
            await request(app.getHttpServer())
                .post('/store/order')
                .send(entityMock)
                .expect(201)
        ).body;
        expect(createdEntity).toEqual(entityMock);
    });

    it('/DELETE orders', async () => {
        const deletedEntity: OrderDTO = (
            await request(app.getHttpServer())
                .delete('/store/order/' + entityMock.id)
                .expect(204)
        ).body;
        expect(deletedEntity).toEqual({});
    });

    it('/GET Returns pet inventory', async () => {
        const getEntity = (
            await request(app.getHttpServer())
                .get('/store/inventory')
                .expect(200)
        ).body;
        expect(getEntity?.SOLD > 0).toEqual(true);
    });

    afterEach(async () => {
        await app.close();
    });
});
