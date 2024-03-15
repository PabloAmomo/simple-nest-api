import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';
import { Test, TestingModule } from '@nestjs/testing';
import { UserNotFoundException } from '@contexts/user/exceptions/user-not-found.exception';
import * as MOCK from '@mocks/app-mocks';
import * as request from 'supertest';

const STANDARD_USER_DATA_NO_ROLE = {
  id: expect.anything(),
  email: expect.anything(),
  name: expect.anything(),
  last: expect.anything(),
};
const STANDARD_USER_DATA = {
  ...STANDARD_USER_DATA_NO_ROLE,
  roles: expect.arrayContaining([]),
};

let mailUserTest = '';
let app: INestApplication = null;
let token = '';
let tokenRefresh = '';

describe('End2End TEST START', () => {
  beforeAll(async () => {
    if (app === null) {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      const configService = app.get(ConfigService);
      mailUserTest = configService.get<string>(
        'MAIL_USER_TEST',
        'user@mail.com',
      );

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          id: MOCK.MOCK_USER_ID_ADMIN,
          password: MOCK.MOCK_password,
        });
      token = response.body.token;
      tokenRefresh = response.body.tokenRefresh;
    }
  });

  it('App should be defined', () => {
    expect(app).toBeDefined();
  });

  it(`Get token for user ${MOCK.MOCK_USER_ID_ADMIN}`, async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        id: MOCK.MOCK_USER_ID_ADMIN,
        password: MOCK.MOCK_password,
      });
    token = response.body.token;
    tokenRefresh = response.body.tokenRefresh;
    expect(token).toBeDefined();
    expect(tokenRefresh).toBeDefined();
  });
});

describe('End2End TEST (DELETE Users TEST)', () => {
  [MOCK.MOCK_USER_TEST_1, MOCK.MOCK_USER_TEST_2].forEach((userId) => {
    it(`/user [Delete user ${token} created above] (DELETE)`, async () => {
      return request(app.getHttpServer())
        .delete(`/user/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect((res) => {
          if (
            res.status !== MOCK.MOCK_HTTP_STATUS_NOT_FOUND &&
            res.status !== MOCK.MOCK_HTTP_STATUS_OK
          ) {
            throw new Error('Invalid status');
          }
          return true;
        });
    });
  });
});

describe('End2End TEST (CREATE Users TEST)', () => {
  [MOCK.MOCK_USER_TEST_1, MOCK.MOCK_USER_TEST_2].forEach((userId) => {
    test(`/user [Create user ${userId}] (POST)`, async () => {
      return request(app.getHttpServer())
        .post('/user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...MOCK.MOCK_userEntity,
          id: userId,
          email: mailUserTest,
          password: MOCK.MOCK_password,
        })
        .expect(MOCK.MOCK_HTTP_STATUS_CREATED);
    });
  });
});

describe('End2End TEST (Users)', () => {
  it(`/user/${MOCK.MOCK_USER_TEST_2} [Test single user with token access with JWT role admin] (GET)`, () => {
    return request(app.getHttpServer())
      .get(`/user/${MOCK.MOCK_USER_TEST_2}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(MOCK.MOCK_HTTP_STATUS_OK)
      .then((response) => {
        expect(response.body).toMatchObject(STANDARD_USER_DATA);
        expect(response.body.id).toBe(MOCK.MOCK_USER_TEST_2);
      });
  });

  it('/user/all [Test get all users with invalid token] (GET)', () => {
    return request(app.getHttpServer())
      .get('/user/all')
      .set('Authorization', `Bearer invalidtoken`)
      .expect(MOCK.MOCK_EXCEPTION_UNAUTHORIZED.getStatus());
  });

  it('/user/all [Test get all user] (GET)', () => {
    return request(app.getHttpServer())
      .get('/user/all')
      .set('Authorization', `Bearer ${token}`)
      .expect(MOCK.MOCK_HTTP_STATUS_OK)
      .then((response) => {
        expect(response.body).toBeInstanceOf(Array);
        const userTest = response.body[0];
        expect(userTest).toMatchObject(STANDARD_USER_DATA);
      });
  });

  it(`/user/${MOCK.MOCK_USER_TEST_2} [Test unnautorized access] (Invalid or not token) (GET)`, () => {
    return request(app.getHttpServer())
      .get(`/user/${MOCK.MOCK_USER_TEST_2}`)
      .expect(MOCK.MOCK_EXCEPTION_UNAUTHORIZED.getStatus());
  });

  it('/user/invalidid [Test if path to delete user works] (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/user/invalidid')
      .set('Authorization', `Bearer ${token}`)
      .expect(MOCK.MOCK_EXCEPTION_USER_NOT_FOUND.getStatus())
      .catch((error) => {
        expect(error).toBeInstanceOf(UserNotFoundException);
      });
  });

  it('/user [Try to create user with incomplete data] (Bad Request) (POST)', () => {
    return request(app.getHttpServer())
      .post('/user')
      .set('Authorization', `Bearer ${token}`)
      .send({
        id: '',
      })
      .expect(MOCK.MOCK_EXCEPTION_INVALID_DATA.getStatus());
  });

  it('/user [Try to create user with incomplete data] (POST)', () => {
    return request(app.getHttpServer())
      .post('/user')
      .set('Authorization', `Bearer ${token}`)
      .send(MOCK.MOCK_CREATE_USER_EMPTY)
      .expect(MOCK.MOCK_EXCEPTION_GENERAL.getStatus())
      .catch((error) => {
        expect(error).toHaveProperty(
          'message',
          'id must be longer than or equal to 1 characters, name must be longer than or equal to 3 characters, last must be longer than or equal to 3 characters, email must be an email, password must be longer than or equal to 8 characters, roles should not be empty, roles must be an array',
        );
      });
  });

  it(`/user/${MOCK.MOCK_USER_TEST_2} [Try to update user with incomplete data] (PUT)`, () => {
    return request(app.getHttpServer())
      .put(`/user/${MOCK.MOCK_USER_TEST_2}`)
      .set('Authorization', `Bearer ${token}`)
      .send(MOCK.MOCK_CREATE_USER_EMPTY)
      .expect(MOCK.MOCK_EXCEPTION_GENERAL.getStatus())
      .catch((error) => {
        expect(error).toHaveProperty(
          'message',
          'name must be longer than or equal to 3 characters, email must be an email, roles should not be empty, roles must be an array',
        );
      });
  });

  it(`/user/${MOCK.MOCK_USER_TEST_2}/roles [Try to update roles for user with invalid token] (PUT)`, () => {
    return request(app.getHttpServer())
      .put(`/user/${MOCK.MOCK_USER_TEST_2}/roles`)
      .set('Authorization', `Bearer invalidtoken`)
      .send(['user'])
      .expect(MOCK.MOCK_EXCEPTION_UNAUTHORIZED.getStatus());
  });

  it('/user/invaliduser/roles [Try to update roles for user invalid] (PUT)', () => {
    return request(app.getHttpServer())
      .put('/user/invaliduser/roles')
      .set('Authorization', `Bearer ${token}`)
      .send(['user'])
      .expect(MOCK.MOCK_EXCEPTION_USER_NOT_FOUND.getStatus())
      .catch((error) => {
        expect(error).toBeInstanceOf(UserNotFoundException);
      });
  });

  it(`/user/${MOCK.MOCK_USER_TEST_2}/roles [Try to update roles with no roles - no roles array] (PUT)`, () => {
    return request(app.getHttpServer())
      .put(`/user/${MOCK.MOCK_USER_TEST_2}/roles`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(MOCK.MOCK_EXCEPTION_INVALID_DATA.getStatus())
      .catch((error) => {
        expect(error).toBeInstanceOf(InvalidDataException);
        expect(error).toHaveProperty('message', 'roles should not be empty');
      });
  });

  it(`/user/${MOCK.MOCK_USER_TEST_2}/roles [Try to update roles with no roles - empty] (PUT)`, () => {
    return request(app.getHttpServer())
      .put(`/user/${MOCK.MOCK_USER_TEST_2}/roles`)
      .set('Authorization', `Bearer ${token}`)
      .send([])
      .expect(MOCK.MOCK_EXCEPTION_INVALID_DATA.getStatus())
      .catch((error) => {
        expect(error).toBeInstanceOf(InvalidDataException);
        expect(error).toHaveProperty('message', 'roles should not be empty');
      });
  });

  it(`/user/${MOCK.MOCK_USER_TEST_2}/roles [Try to update roles with invalid roles] (PUT)`, () => {
    return request(app.getHttpServer())
      .put(`/user/${MOCK.MOCK_USER_TEST_2}/roles`)
      .set('Authorization', `Bearer ${token}`)
      .send(['invalidrole'])
      .expect(MOCK.MOCK_EXCEPTION_INVALID_DATA.getStatus())
      .catch((error) => {
        expect(error).toBeInstanceOf(InvalidDataException);
        expect(error).toHaveProperty('message', 'roles should not be empty');
      });
  });

  it(`/user/${MOCK.MOCK_USER_TEST_2}/roles [Try to update roles user 2 to user] (PUT)`, () => {
    return request(app.getHttpServer())
      .put(`/user/${MOCK.MOCK_USER_TEST_2}/roles`)
      .set('Authorization', `Bearer ${token}`)
      .send(['user'])
      .expect(MOCK.MOCK_HTTP_STATUS_OK);
  });

  it(`/user/${MOCK.MOCK_USER_TEST_2}/disable [Try to disable user 2] (PUT)`, () => {
    return request(app.getHttpServer())
      .put(`/user/${MOCK.MOCK_USER_TEST_2}/disable`)
      .set('Authorization', `Bearer ${token}`)
      .expect(MOCK.MOCK_HTTP_STATUS_OK);
  });

  it(`/user/${MOCK.MOCK_USER_TEST_2}/enable [Try to enable user 2] (PUT)`, () => {
    return request(app.getHttpServer())
      .put(`/user/${MOCK.MOCK_USER_TEST_2}/enable`)
      .set('Authorization', `Bearer ${token}`)
      .expect(MOCK.MOCK_HTTP_STATUS_OK);
  });
});

describe('End2End TEST (DELETE Users TEST)', () => {
  [MOCK.MOCK_USER_TEST_1, MOCK.MOCK_USER_TEST_2].forEach((userId) => {
    it(`/user [Delete user ${userId} created above] (DELETE)`, async () => {
      return request(app.getHttpServer())
        .delete(`/user/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(MOCK.MOCK_HTTP_STATUS_OK);
    });
  });
});

describe('End2End TEST (Final - Close App)', () => {
  it('App si defined', () => {
    expect(app).toBeDefined();
  });

  afterAll(async () => {
    try {
      await app.close();
    } catch (error) {}
  });
});
