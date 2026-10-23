import { Injectable, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import {
  getConnectionToken,
  SequelizeModule,
  SequelizeModuleOptions,
  SequelizeOptionsFactory,
} from '../../lib/index.js';

const sequelizeOptions: SequelizeModuleOptions = {
  dialect: 'postgres',
  host: '0.0.0.0',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'test',
  logging: false,
};

@Injectable()
class OptionsFactory implements SequelizeOptionsFactory {
  createSequelizeOptions(): SequelizeModuleOptions {
    return sequelizeOptions;
  }
}

describe('SequelizeCoreModule shutdown', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    {
      case: 'named forRootAsync (name only on async options)',
      name: 'secondary',
      createModule: () =>
        SequelizeModule.forRootAsync({
          name: 'secondary',
          useFactory: () => sequelizeOptions,
        }),
    },
    {
      case: 'named forRootAsync (factory returns a different name)',
      name: 'secondary',
      createModule: () =>
        SequelizeModule.forRootAsync({
          name: 'secondary',
          useFactory: () => ({ ...sequelizeOptions, name: 'other' }),
        }),
    },
    {
      case: 'named forRootAsync (useClass)',
      name: 'secondary',
      createModule: () =>
        SequelizeModule.forRootAsync({
          name: 'secondary',
          useClass: OptionsFactory,
        }),
    },
    {
      case: 'unnamed forRootAsync',
      name: 'default',
      createModule: () =>
        SequelizeModule.forRootAsync({
          useFactory: () => sequelizeOptions,
        }),
    },
    {
      case: 'named forRoot',
      name: 'secondary',
      createModule: () =>
        SequelizeModule.forRoot({
          ...sequelizeOptions,
          name: 'secondary',
        }),
    },
    {
      case: 'unnamed forRoot',
      name: 'default',
      createModule: () => SequelizeModule.forRoot(sequelizeOptions),
    },
  ])('closes the connection ($case)', async ({ name, createModule }) => {
    const loggerError = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    const staticLoggerError = vi
      .spyOn(Logger, 'error')
      .mockImplementation(() => {});

    const moduleRef = await Test.createTestingModule({
      imports: [createModule()],
    }).compile();

    const connection = moduleRef.get<Sequelize>(getConnectionToken(name));
    const close = vi.spyOn(connection, 'close').mockResolvedValue();

    await moduleRef.close();

    expect(close).toHaveBeenCalledTimes(1);
    expect(loggerError).not.toHaveBeenCalled();
    expect(staticLoggerError).not.toHaveBeenCalled();
  });

  it('keeps the connection open when the factory sets autoCloseConnection to false', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRootAsync({
          name: 'secondary',
          useFactory: () => ({
            ...sequelizeOptions,
            autoCloseConnection: false,
          }),
        }),
      ],
    }).compile();

    const connection = moduleRef.get<Sequelize>(
      getConnectionToken('secondary'),
    );
    const close = vi.spyOn(connection, 'close').mockResolvedValue();

    await moduleRef.close();

    expect(close).not.toHaveBeenCalled();
  });
});
