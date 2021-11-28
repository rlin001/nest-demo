import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { AuthGuard } from '../src/security';
import { RolesGuard } from '../src/security';
import { PetDTO } from '../src/service/dto/pet.dto';
import { PetService } from '../src/service/pet.service';
import {CategoryService} from "../src/service/category.service";
import {TagService} from "../src/service/tag.service";

describe('Pet Controller', () => {
    let app: INestApplication;

    const authGuardMock = { canActivate: (): any => true };
    const rolesGuardMock = { canActivate: (): any => true };
    const entityMock: any = {
        id: 'entityId'
    }

    const serviceMock = {
        findById: (): any => entityMock,
        save: (): any => entityMock,
        update: (): any => entityMock,
        deleteById: (): any => entityMock,
        find: (): any => [entityMock],
    };


    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).overrideGuard(AuthGuard)
        .useValue(authGuardMock)
        .overrideGuard(RolesGuard)
        .useValue(rolesGuardMock)
        .overrideProvider(PetService)
        .useValue(serviceMock)
        .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/GET pet by id', async () => {
        const getEntity: PetDTO = (await request(app.getHttpServer())
            .get('/pet/' + entityMock.id)
            .expect(200)).body;

        expect(getEntity).toEqual(entityMock);
    }
    );

    it('/POST create pet', async () => {

        const createdEntity: PetDTO = (await request(app.getHttpServer())
            .post('/pet')
            .send(entityMock)
            .expect(201)).body;
        expect(createdEntity).toEqual(entityMock);
    }
    );

    it('/PUT update pet', async () => {
        const updatedEntity: PetDTO = (await request(app.getHttpServer())
            .put('/pet')
            .send(entityMock)
            .expect(201)).body;
        expect(updatedEntity).toEqual(entityMock);

    }
    );

    it('/DELETE pets', async () => {
        const deletedEntity: PetDTO = (await request(app.getHttpServer())
            .delete('/pet/' + entityMock.id)
            .expect(204)).body;
            expect(deletedEntity).toEqual({});
    }
    );

    it('/POST pets', async () => {
        const updatedEntity: PetDTO = (await request(app.getHttpServer())
          .post('/pet/' + entityMock.id)
          .expect(201)).body;
      expect(updatedEntity).toEqual(entityMock);
      }
    )

    it('/GET finds pets by status', async () => {
        const getEntity: PetDTO = (await request(app.getHttpServer())
          .get('/pet/findByStatus')
          .send(entityMock)
          .expect(200)).body;
        expect(getEntity).toEqual([entityMock]);
      }
    );

    afterEach(async () => {
        await app.close();
    });
});

