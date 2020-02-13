import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import * as request from 'supertest';
import { AsyncOptionsExistingModule } from '../src/async-existing-options.module';

describe('Sequelize (async configuration)', () => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AsyncOptionsExistingModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it(`should return created entity`, () => {
    return request(server)
      .post('/photo')
      .expect(201)
      .expect(res => {
        if (res.body.name !== 'Nest') throw new Error('invalid name');
        if (res.body.description !== 'Is great!')
          throw new Error('invalid description');
        if (res.body.views !== 6000) throw new Error('invalid views');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
