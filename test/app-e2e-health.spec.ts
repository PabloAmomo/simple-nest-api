import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as MOCK from '@mocks/app-mocks';
import * as request from 'supertest';

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

describe('End2End TEST (Healths)', () => {
  it('/health [Check health] (GET)', () => {
    return checkHealth('/health');
  });

  it('/auth/health [Check health] (GET)', () => {
    return checkHealth('/auth/health');
  });

  it('/user/profile/health [Check health] (SECURE) (GET)', () => {
    return checkHealth('/user/profile/health');
  });

  it('/user/register/health [Check health] (GET)', () => {
    return checkHealth('/user/register/health');
  });

  it('/user/health [Check health] (SECURE) (GET)', () => {
    return checkHealth('/user/health');
  });

  it('/email/health [Check health] (GET)', () => {
    return checkHealth('/email/health');
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

async function checkHealth(path: string) {
  return request(app.getHttpServer())
    .get(path)
    .expect(MOCK.MOCK_HTTP_STATUS_OK)
    .then((response) => {
      expect(response.body.status).toEqual('ok');
    });
}
