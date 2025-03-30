import { DynamicModule, Module } from '@nestjs/common';
import { SequelizeOptions } from 'sequelize-typescript';
import { EntitiesMetadataStorage } from './entities-metadata.storage';
import {
  SequelizeModuleAsyncOptions,
  SequelizeModuleOptions,
} from './interfaces/sequelize-options.interface';
import { SequelizeCoreModule } from './sequelize-core.module';
import { DEFAULT_CONNECTION_NAME } from './sequelize.constants';
import { createSequelizeProviders } from './sequelize.providers';

/**
 * @publicApi
 */
@Module({})
export class SequelizeModule {
  static forRoot(options: SequelizeModuleOptions): DynamicModule {
    return {
      module: SequelizeModule,
      imports: [SequelizeCoreModule.forRoot(options)],
    };
  }

  static forFeature(
    entities: Function[] = [],
    connection: SequelizeOptions | string = DEFAULT_CONNECTION_NAME,
  ): DynamicModule {
    const providers = createSequelizeProviders(entities, connection);
    EntitiesMetadataStorage.addEntitiesByConnection(connection, entities);
    return {
      module: SequelizeModule,
      providers: providers,
      exports: providers,
    };
  }

  static forRootAsync(options: SequelizeModuleAsyncOptions): DynamicModule {
    return {
      module: SequelizeModule,
      imports: [SequelizeCoreModule.forRootAsync(options)],
    };
  }
}
