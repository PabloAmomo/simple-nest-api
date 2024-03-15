import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
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

describe('End2End TEST (user/Register)', () => {
  it('/user/register [Try to register user with incomplete data] (Without Authorization Bearer) (POST)', () => {
    return request(app.getHttpServer())
      .post('/user/register')
      .send({
        id: '',
      })
      .expect(MOCK.MOCK_EXCEPTION_INVALID_DATA.getStatus());
  });

  it('/user/register [Try to register user with incomplete data] (POST)', () => {
    return request(app.getHttpServer())
      .post('/user/register')
      .send(MOCK.MOCK_CREATE_USER_EMPTY)
      .expect(MOCK.MOCK_EXCEPTION_GENERAL.getStatus())
      .catch((error) => {
        expect(error).toHaveProperty(
          'message',
          'id must be longer than or equal to 1 characters, name must be longer than or equal to 3 characters, last must be longer than or equal to 3 characters, email must be an email, password must be longer than or equal to 8 characters',
        );
      });
  });

  it(`/user/register [Register new user ${MOCK.MOCK_USER_TEST_2}] (With Authorization Bearer) (POST)`, () => {
    return request(app.getHttpServer())
      .post('/user/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...MOCK.MOCK_userReqUserRegisterDto,
        id: MOCK.MOCK_USER_TEST_2,
        email: mailUserTest,
        password: MOCK.MOCK_password,
      })
      .then((response) => {
        expect(true).toBe(
          [
            MOCK.MOCK_HTTP_STATUS_CREATED,
            MOCK.MOCK_EXCEPTION_GENERAL.getStatus(),
          ].includes(response.statusCode),
        );
        if (response.statusCode === MOCK.MOCK_EXCEPTION_GENERAL.getStatus()) {
          expect(response.body).toHaveProperty(
            'message',
            'user already exists',
          );
        }
      });
  });

  it(`/user/${MOCK.MOCK_USER_TEST_2} [Delete registered test user ${MOCK.MOCK_USER_TEST_2}] (POST)`, () => {
    return request(app.getHttpServer())
      .delete(`/user/${MOCK.MOCK_USER_TEST_2}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(MOCK.MOCK_HTTP_STATUS_OK);
  });

  it(`/user/register [Register new user ${MOCK.MOCK_USER_TEST_2}] (Without Authorization Bearer) (POST)`, () => {
    return request(app.getHttpServer())
      .post('/user/register')
      .send({
        ...MOCK.MOCK_userReqUserRegisterDto,
        id: MOCK.MOCK_USER_TEST_2,
        email: mailUserTest,
        password: MOCK.MOCK_password,
      })
      .then((response) => {
        expect(true).toBe(
          [
            MOCK.MOCK_HTTP_STATUS_CREATED,
            MOCK.MOCK_EXCEPTION_GENERAL.getStatus(),
          ].includes(response.statusCode),
        );
        if (response.statusCode === MOCK.MOCK_EXCEPTION_GENERAL.getStatus()) {
          expect(response.body).toHaveProperty(
            'message',
            'user already exists',
          );
        }
      });
  });

  it('/user/register [Register new user with invalid password] (Without Authorization Bearer) (POST)', () => {
    return request(app.getHttpServer())
      .post('/user/register')
      .send({
        ...MOCK.MOCK_userReqUserRegisterDto,
        id: Date.now().toString(),
        password: 'nopass',
      })
      .expect(MOCK.MOCK_EXCEPTION_GENERAL.getStatus())
      .then((response) => {
        expect(response.body).toHaveProperty(
          'message',
          'password must be longer than or equal to 8 characters',
        );
      });
  });

  it(`/user/${MOCK.MOCK_USER_TEST_2} [Delete registered test user ${MOCK.MOCK_USER_TEST_2}] (POST)`, () => {
    return request(app.getHttpServer())
      .delete(`/user/${MOCK.MOCK_USER_TEST_2}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(MOCK.MOCK_HTTP_STATUS_OK);
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
