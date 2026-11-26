import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import {
  getConnectionToken,
  SequelizeModule,
  SequelizeModuleOptions,
} from '../../lib/index.js';

const sequelizeOptions: SequelizeModuleOptions = {
  dialect: 'postgres',
  host: '0.0.0.0',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'test',
  logging: false,
  autoLoadModels: true,
  retryAttempts: 3,
  retryDelay: 0,
};

describe('SequelizeCoreModule failed connection attempts', () => {
  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('closes the instance of every attempt that fails to authenticate', async () => {
    vi.spyOn(Sequelize.prototype, 'authenticate').mockRejectedValue(
      new Error('authenticate failed'),
    );
    const close = vi.spyOn(Sequelize.prototype, 'close').mockResolvedValue();

    await expect(
      Test.createTestingModule({
        imports: [SequelizeModule.forRoot(sequelizeOptions)],
      }).compile(),
    ).rejects.toThrow('authenticate failed');

    expect(close).toHaveBeenCalledTimes(3);
  });

  it('closes the instance of every attempt that fails to sync', async () => {
    vi.spyOn(Sequelize.prototype, 'authenticate').mockResolvedValue();
    vi.spyOn(Sequelize.prototype, 'sync').mockRejectedValue(
      new Error('sync failed'),
    );
    const close = vi.spyOn(Sequelize.prototype, 'close').mockResolvedValue();

    await expect(
      Test.createTestingModule({
        imports: [
          SequelizeModule.forRootAsync({
            useFactory: () => sequelizeOptions,
          }),
        ],
      }).compile(),
    ).rejects.toThrow('sync failed');

    expect(close).toHaveBeenCalledTimes(3);
  });

  it('rethrows the original error when closing fails', async () => {
    vi.spyOn(Sequelize.prototype, 'authenticate').mockRejectedValue(
      new Error('authenticate failed'),
    );
    vi.spyOn(Sequelize.prototype, 'close').mockRejectedValue(
      new Error('close failed'),
    );

    await expect(
      Test.createTestingModule({
        imports: [SequelizeModule.forRoot(sequelizeOptions)],
      }).compile(),
    ).rejects.toThrow('authenticate failed');
  });

  it('keeps the instance of the attempt that succeeds open', async () => {
    const authenticate = vi
      .spyOn(Sequelize.prototype, 'authenticate')
      .mockRejectedValueOnce(new Error('authenticate failed'))
      .mockResolvedValue();
    vi.spyOn(Sequelize.prototype, 'sync').mockResolvedValue(
      undefined as unknown as Sequelize,
    );
    const close = vi.spyOn(Sequelize.prototype, 'close').mockResolvedValue();

    const moduleRef = await Test.createTestingModule({
      imports: [SequelizeModule.forRoot(sequelizeOptions)],
    }).compile();

    expect(authenticate).toHaveBeenCalledTimes(2);
    expect(close).toHaveBeenCalledTimes(1);
    expect(close.mock.contexts[0]).not.toBe(
      moduleRef.get(getConnectionToken()),
    );

    await moduleRef.close();
    expect(close).toHaveBeenCalledTimes(2);
  });
});
