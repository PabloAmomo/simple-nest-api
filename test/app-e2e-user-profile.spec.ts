import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import * as MOCK from '@mocks/app-mocks';
import * as request from 'supertest';

const STANDARD_USER_DATA_NO_ROLE = {
  id: expect.anything(),
  email: expect.anything(),
  name: expect.anything(),
  last: expect.anything(),
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

describe('End2End TEST (user/Profile)', () => {
  it(`/user/profile [Change the user ${MOCK.MOCK_USER_ID_ADMIN} profile] (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...MOCK.MOCK_userProfileDto,
        name: 'John Modified',
        email: mailUserTest,
      })
      .expect(MOCK.MOCK_HTTP_STATUS_OK);
  });

  it(`/user/profile [Restore the user ${MOCK.MOCK_USER_ID_ADMIN} profile] (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...MOCK.MOCK_userProfileDto,
        email: mailUserTest,
      })
      .expect(MOCK.MOCK_HTTP_STATUS_OK);
  });

  it(`/user/profile [Get the user ${MOCK.MOCK_USER_ID_ADMIN} profile] (GET)`, () => {
    return request(app.getHttpServer())
      .get('/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(MOCK.MOCK_HTTP_STATUS_OK)
      .then((response) => {
        expect(response.body).toHaveProperty('id', MOCK.MOCK_USER_ID_ADMIN);
        expect(response.body).toMatchObject(STANDARD_USER_DATA_NO_ROLE);
      });
  });

  it('/user/profile [Try to update profile with incomplete data] (Bad Request) (PUT)', () => {
    return request(app.getHttpServer())
      .put('/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: '',
      })
      .expect(MOCK.MOCK_EXCEPTION_INVALID_DATA.getStatus());
  });

  it('/user/profile [Try to update profile with incomplete data] (PUT)', () => {
    return request(app.getHttpServer())
      .put('/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: '',
        last: '',
        email: '',
      })
      .expect(MOCK.MOCK_EXCEPTION_GENERAL.getStatus())
      .catch((error) => {
        expect(error).toHaveProperty(
          'message',
          'name must be longer than or equal to 3 characters, last must be longer than or equal to 3 characters, email must be an email',
        );
      });
  });

  it('Send a file to the server for the user profile', async () => {
    const filePath = __dirname + '/aux-files/test-image.jpg';
    if (fs.existsSync(filePath)) {
      return request(app.getHttpServer())
        .post('/user/profile/image')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'multipart/form-data')
        .attach('image', filePath)
        .expect(MOCK.MOCK_HTTP_STATUS_CREATED);
    } else {
      throw new Error(`El archivo ${filePath} no existe.`);
    }
  });

  it('Send a file to the server for the user profile (Invalid Extension)', async () => {
    const filePath = __dirname + '/aux-files/test-image.jpg';
    if (fs.existsSync(filePath)) {
      return request(app.getHttpServer())
        .post('/user/profile/image')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'multipart/form-data')
        .attach('image', filePath, 'test-image.xxx')
        .catch((error) => {
          expect(error).toBeInstanceOf(InvalidDataException);
          expect(error).toHaveProperty('response');
          expect(error.response).toHaveProperty(
            'text',
            'the file extension xxx is not allowed',
          );
        });
    } else {
      throw new Error(`El archivo ${filePath} no existe.`);
    }
  });

  it('Get the user profile image', async () => {
    return request(app.getHttpServer())
      .get('/user/profile/image')
      .set('Authorization', `Bearer ${token}`)
      .expect(MOCK.MOCK_HTTP_STATUS_OK)
      .then((response) => {
        const buffer = Buffer.from(response.body);
        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
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
