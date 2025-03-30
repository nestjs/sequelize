import { Inject } from '@nestjs/common';
import { SequelizeModuleOptions } from '../interfaces/sequelize-options.interface';
import { DEFAULT_CONNECTION_NAME } from '../sequelize.constants';
import { getConnectionToken, getModelToken } from './sequelize.utils';

/**
 * @publicApi
 */
export const InjectModel = (
  entity: Function,
  connection: string = DEFAULT_CONNECTION_NAME,
) => Inject(getModelToken(entity, connection));

/**
 * @publicApi
 */
export const InjectConnection: (
  connection?: SequelizeModuleOptions | string,
) => ParameterDecorator = (connection?: SequelizeModuleOptions | string) =>
  Inject(getConnectionToken(connection));
