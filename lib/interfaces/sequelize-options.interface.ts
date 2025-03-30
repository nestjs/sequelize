import { Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { SequelizeOptions } from 'sequelize-typescript';

/**
 * @publicApi
 */
export type SequelizeModuleOptions = {
  /**
   * Connection name
   */
  name?: string;
  /**
   * Number of times to retry connecting
   * Default: 10
   */
  retryAttempts?: number;
  /**
   * Delay between connection retry attempts (ms)
   * Default: 3000
   */
  retryDelay?: number;
  /**
   * If `true`, models will be loaded automatically.
   */
  autoLoadModels?: boolean;
  /**
   * If `true`, "sequelize.sync()" will be called.
   * Default: true
   */
  synchronize?: boolean;
  /**
   * Sequelize connection string
   */
  uri?: string;
} & Partial<SequelizeOptions>;

/**
 * @publicApi
 */
export interface SequelizeOptionsFactory {
  createSequelizeOptions(
    connectionName?: string,
  ): Promise<SequelizeModuleOptions> | SequelizeModuleOptions;
}

/**
 * @publicApi
 */
export interface SequelizeModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useExisting?: Type<SequelizeOptionsFactory>;
  useClass?: Type<SequelizeOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<SequelizeModuleOptions> | SequelizeModuleOptions;
  inject?: any[];
}
