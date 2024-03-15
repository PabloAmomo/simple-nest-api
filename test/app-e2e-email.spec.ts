import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';
import { Test, TestingModule } from '@nestjs/testing';
import * as MOCK from '@mocks/app-mocks';
import * as request from 'supertest';

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

describe('End2End TEST (Email)', () => {
  it('/email/send [Check email send] (GET)', () => {
    return request(app.getHttpServer())
      .get('/email/send')
      .set('Authorization', `Bearer ${token}`)
      .query({ email: mailUserTest })
      .expect(MOCK.MOCK_HTTP_STATUS_OK)
      .then((response) => {
        expect(response.body.status).toEqual('ok');
      });
  });

  it('/email/send [Invalid email] (GET)', () => {
    return request(app.getHttpServer())
      .get('/email/send')
      .set('Authorization', `Bearer ${token}`)
      .query({ email: '' })
      .expect(MOCK.MOCK_EXCEPTION_INVALID_DATA.getStatus())
      .catch((response) => {
        expect(response).toBeInstanceOf(InvalidDataException);
        expect(response).toHaveProperty('message', 'invalid email address');
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
