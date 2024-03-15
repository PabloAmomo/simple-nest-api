import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserNotFoundException } from '@contexts/user/exceptions/user-not-found.exception';
import * as MOCK from '@mocks/app-mocks';
import * as request from 'supertest';

let app: INestApplication = null;
let token = '';
let newTokenByRefresh = '';
let refreshToken = '';

describe('End2End TEST START', () => {
  beforeAll(async () => {
    if (app === null) {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          id: MOCK.MOCK_USER_ID_ADMIN,
          password: MOCK.MOCK_password,
        });
      token = response.body.token;
      refreshToken = response.body.tokenRefresh;
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
    refreshToken = response.body.tokenRefresh;
    expect(token).toBeDefined();
    expect(refreshToken).toBeDefined();
  });
});

describe('End2End TEST (Auth)', () => {
  it(`/auth/login [Invalid login for user ${MOCK.MOCK_USER_TEST_2} with user and password] (POST)`, () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        id: MOCK.MOCK_USER_TEST_2,
        password: 'invalidpassword',
      })
      .expect(MOCK.MOCK_EXCEPTION_UNAUTHORIZED.getStatus());
  });

  it(`/auth/login [Login with user and password for user ${MOCK.MOCK_USER_ID_ADMIN} obtain token] (POST)`, () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        id: MOCK.MOCK_USER_ID_ADMIN,
        password: MOCK.MOCK_password,
      })
      .expect(MOCK.MOCK_HTTP_STATUS_CREATED)
      .then((response) => {
        expect(response.body).toMatchObject({
          token: expect.anything(),
          id: expect.stringContaining(MOCK.MOCK_USER_ID_ADMIN),
        });
      });
  });

  it('/auth/change-password [Change password for the user with token access] (PUT)', () => {
    return request(app.getHttpServer())
      .put('/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        password: 'password-changed',
      })
      .expect(MOCK.MOCK_HTTP_STATUS_OK);
  });

  it('/auth/change-password [Restore password for the user with token access] (PUT)', () => {
    return request(app.getHttpServer())
      .put('/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        password: MOCK.MOCK_password,
      })
      .expect(MOCK.MOCK_HTTP_STATUS_OK);
  });

  it('/auth/change-password [Invalid password for the user with token access] (PUT)', () => {
    return request(app.getHttpServer())
      .put('/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        password: MOCK.MOCK_INVALID_SHORT_PASSWORD,
      })
      .expect(MOCK.MOCK_EXCEPTION_GENERAL.getStatus())
      .then((response) => {
        expect(response.body.message).toBe(
          'password must be longer than or equal to 8 characters',
        );
      });
  });

  it('/auth/1/activate [Try to activate user 1] (PUT)', () => {
    return request(app.getHttpServer())
      .put('/auth/1/activate')
      .send({ activationToken: MOCK.MOCK_activationToken })
      .expect(MOCK.MOCK_HTTP_STATUS_OK);
  });

  it('/auth/1/activate [Try to activate user 1] (GET)', () => {
    return request(app.getHttpServer())
      .get('/auth/1/activate')
      .query({ activationToken: MOCK.MOCK_activationToken })
      .expect(MOCK.MOCK_HTTP_STATUS_OK);
  });

  it('/auth/invalid/activate [Try to activate user invalid user] (GET)', () => {
    return request(app.getHttpServer())
      .get('/auth/invalid/activate')
      .query({ activationToken: MOCK.MOCK_activationToken })
      .expect(MOCK.MOCK_EXCEPTION_USER_NOT_FOUND.getStatus())
      .catch((error) => {
        expect(error).toBeInstanceOf(UserNotFoundException);
      });
  });

  it(`/auth/token/refresh [Refresh token] (GET)`, () => {
    return request(app.getHttpServer())
      .get('/auth/token/refresh')
      .query({ token })
      .set('Authorization', `Bearer ${refreshToken}`)
      .send()
      .then((response) => {
        expect(response.body).toHaveProperty('token');
        if (response.body.token) {
          newTokenByRefresh = response.body.token;
        }
      });
  });

  it('/auth/change-password [Try to change password with black listed token] (PUT)', () => {
    return request(app.getHttpServer())
      .put('/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        password: MOCK.MOCK_password,
      })
      .expect(MOCK.MOCK_EXCEPTION_UNAUTHORIZED.getStatus());
  });

  it('/auth/change-password [Try to change password with NEW token] (PUT)', () => {
    return request(app.getHttpServer())
      .put('/auth/change-password')
      .set('Authorization', `Bearer ${newTokenByRefresh}`)
      .send({
        password: MOCK.MOCK_password,
      })
      .expect(MOCK.MOCK_HTTP_STATUS_OK);
  });

  it('/auth/logout [Logout User] (GET)', () => {
    return request(app.getHttpServer())
      .get('/auth/logout')
      .set('Authorization', `Bearer ${newTokenByRefresh}`)
      .query({ refreshToken })
      .expect(MOCK.MOCK_HTTP_STATUS_OK);
  });

  it(`/auth/token/refresh [Try to Refresh token with refreshToken blacklisted] (GET)`, () => {
    return request(app.getHttpServer())
      .get('/auth/token/refresh')
      .query({ token })
      .set('Authorization', `Bearer ${refreshToken}`)
      .send()
      .expect(MOCK.MOCK_EXCEPTION_UNAUTHORIZED.getStatus());
  });

  it('/auth/change-password [Try to change password with NEW token blacklisted] (PUT)', () => {
    return request(app.getHttpServer())
      .put('/auth/change-password')
      .set('Authorization', `Bearer ${newTokenByRefresh}`)
      .send({
        password: MOCK.MOCK_password,
      })
      .expect(MOCK.MOCK_EXCEPTION_UNAUTHORIZED.getStatus());
  });
});

describe('End2End TEST (Final - Close App)', () => {
  it('App defined', () => {
    expect(app).toBeDefined();
  });

  afterAll(async () => {
    try {
      await app.close();
    } catch (error) {}
  });
});
