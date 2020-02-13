import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
  Provider,
  Type,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { defer } from 'rxjs';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import {
  generateString,
  getConnectionToken,
  handleRetry,
} from './common/sequelize.utils';
import { EntitiesMetadataStorage } from './entities-metadata.storage';
import {
  SequelizeModuleAsyncOptions,
  SequelizeModuleOptions,
  SequelizeOptionsFactory,
} from './interfaces/sequelize-options.interface';
import {
  DEFAULT_CONNECTION_NAME,
  SEQUELIZE_MODULE_ID,
  SEQUELIZE_MODULE_OPTIONS,
} from './sequelize.constants';

@Global()
@Module({})
export class SequelizeCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(SEQUELIZE_MODULE_OPTIONS)
    private readonly options: SequelizeModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  static forRoot(options: SequelizeModuleOptions = {}): DynamicModule {
    const sequelizeModuleOptions = {
      provide: SEQUELIZE_MODULE_OPTIONS,
      useValue: options,
    };
    const connectionProvider = {
      provide: getConnectionToken(options as SequelizeOptions) as string,
      useFactory: async () => await this.createConnectionFactory(options),
    };

    return {
      module: SequelizeCoreModule,
      providers: [connectionProvider, sequelizeModuleOptions],
      exports: [connectionProvider],
    };
  }

  static forRootAsync(options: SequelizeModuleAsyncOptions): DynamicModule {
    const connectionProvider = {
      provide: getConnectionToken(options as SequelizeOptions) as string,
      useFactory: async (sequelizeOptions: SequelizeModuleOptions) => {
        if (options.name) {
          return await this.createConnectionFactory({
            ...sequelizeOptions,
            name: options.name,
          });
        }
        return await this.createConnectionFactory(sequelizeOptions);
      },
      inject: [SEQUELIZE_MODULE_OPTIONS],
    };

    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: SequelizeCoreModule,
      imports: options.imports,
      providers: [
        ...asyncProviders,
        connectionProvider,
        {
          provide: SEQUELIZE_MODULE_ID,
          useValue: generateString(),
        },
      ],
      exports: [connectionProvider],
    };
  }

  async onApplicationShutdown() {
    const connection = this.moduleRef.get<Sequelize>(
      getConnectionToken(this.options as SequelizeOptions) as Type<Sequelize>,
    );
    connection && (await connection.close());
  }

  private static createAsyncProviders(
    options: SequelizeModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<SequelizeOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: SequelizeModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: SEQUELIZE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // `as Type<SequelizeOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (options.useClass || options.useExisting) as Type<
        SequelizeOptionsFactory
      >,
    ];
    return {
      provide: SEQUELIZE_MODULE_OPTIONS,
      useFactory: async (optionsFactory: SequelizeOptionsFactory) =>
        await optionsFactory.createSequelizeOptions(options.name),
      inject,
    };
  }

  private static async createConnectionFactory(
    options: SequelizeModuleOptions,
  ): Promise<Sequelize> {
    return await defer(async () => {
      if (!options.autoLoadModels) {
        return new Sequelize(options as SequelizeOptions);
      }

      const connectionToken = options.name || DEFAULT_CONNECTION_NAME;
      const sequelize = new Sequelize(options);
      const models = EntitiesMetadataStorage.getEntitiesByConnection(
        connectionToken,
      );
      sequelize.addModels(models as any);
      if (typeof options.synchronize === 'undefined' || options.synchronize) {
        await sequelize.sync(options.sync);
      }
      return sequelize;
    })
      .pipe(handleRetry(options.retryAttempts, options.retryDelay))
      .toPromise();
  }
}
