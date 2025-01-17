import { Provider } from '@nestjs/common';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { getConnectionToken, getModelToken } from './common/sequelize.utils';

export function createSequelizeProviders(
  entities?: Function[],
  connection?: SequelizeOptions | string,
): Provider[] {
  const repositories = (entities || []).map((entity) => ({
    provide: getModelToken(entity, connection),
    useFactory: (connection: Sequelize) => {
      if (!connection.repositoryMode) {
        return entity;
      }
      return connection.getRepository(entity as any);
    },
    inject: [getConnectionToken(connection)],
  }));

  return [...repositories];
}
