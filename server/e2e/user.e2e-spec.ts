import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { AuthGuard } from '../src/security';
import { RolesGuard } from '../src/security';
import { UserDTO } from '../src/service/dto/user.dto';
import { AuthService } from '../src/service/auth.service';
import { UserService } from '../src/service/user.service';
import any = jasmine.any;

describe('Account Controller', () => {
    let app: INestApplication;

    const authGuardMock = { canActivate: (): any => true };
    const rolesGuardMock = { canActivate: (): any => true };
    const entityMock: any = {
        id: 'entityId',
        userName: 'userName'
    }

    const serviceMock = {
        saveList: (): any => [entityMock],
        findById: (): any => entityMock,
        save: (): any => entityMock,
        update: (): any => entityMock,
        find: (): any => entityMock,
        delete: (): any => entityMock,
        login: (): any => ({
          'id_token': 'id_token'
        }),
        logout: (): any => true,
    };

    const authServiceMock = {
      login: (): any => ({
        'id_token': 'id_token'
      }),
      logout: (): any => true,
    }


    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).overrideGuard(AuthGuard)
        .useValue(authGuardMock)
        .overrideGuard(RolesGuard)
        .useValue(rolesGuardMock)
        .overrideProvider(AuthService)
        .useValue(authServiceMock)
        .overrideProvider(UserService)
        .useValue(serviceMock)
        .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/POST Create list of user with given input array', async () => {
        const createdEntity: [UserDTO] = (await request(app.getHttpServer())
          .post('/user/createWithList')
          .send([entityMock])
          .expect(201)).body;
        expect(createdEntity).toEqual([entityMock]);
      }
    );

    it('/GET get user by userName', async () => {
        const getEntity: UserDTO = (await request(app.getHttpServer())
            .get('/user/' + entityMock.userName)
            .expect(200)).body;
        expect(getEntity).toEqual(entityMock);
    }
    );

    it('/PUT update user by userName', async () => {
        const updatedEntity: UserDTO = (await request(app.getHttpServer())
          .put('/user/' + entityMock.userName)
          .send(entityMock)
          .expect(200)).body;
        expect(updatedEntity).toEqual(entityMock);

      }
    );

    it('/DELETE delete user by userName', async () => {
        const deletedEntity: UserDTO = (await request(app.getHttpServer())
          .delete('/user/' + entityMock.userName)
          .expect(204)).body;
        expect(deletedEntity).toEqual({});
      }
    );

    it('/GET Login user into the system', async () => {
        const createdEntity: any = (await request(app.getHttpServer())
            .get('/user/login')
            .send({
              'username': 'username',
              'password': 'password'
            })
            .expect(200)).body;
        expect(createdEntity).toEqual(entityMock);
    }
    );

  it('/GET Logout user', async () => {
      const createdEntity: any = (await request(app.getHttpServer())
        .get('/user/logout')
        .expect(200)).body;
      expect(createdEntity).toEqual(entityMock);
    }
  );

    it('/POST Create list of user with given input array', async () => {
        const createdEntity: [UserDTO] = (await request(app.getHttpServer())
          .post('/user/createWithArray')
          .send([entityMock])
          .expect(201)).body;
        expect(createdEntity).toEqual([entityMock]);
      }
    );

    it('/POST Create user', async () => {
        const updatedEntity: UserDTO = (await request(app.getHttpServer())
          .post('/user')
          .expect(201)).body;
      expect(updatedEntity).toEqual(entityMock);
      }
    );

    afterEach(async () => {
        await app.close();
    });
});

