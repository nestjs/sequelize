import { Logger, Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import { delay, retryWhen, scan } from 'rxjs/operators';
import { Sequelize } from 'sequelize-typescript';
import { v4 as uuid } from 'uuid';
import { CircularDependencyException } from '../exceptions/circular-dependency.exception';
import { SequelizeModuleOptions } from '../interfaces';
import { DEFAULT_CONNECTION_NAME } from '../sequelize.constants';

const logger = new Logger('SequelizeModule');

/**
 * This function generates an injection token for an Repostiory
 * @param {Function} This parameter can either be a Repostiory
 * @param {string} [connection='default'] Connection name
 * @returns {string} The Entity injection token
 */
export function getModelToken(
  entity: Function,
  connection: SequelizeModuleOptions | string = DEFAULT_CONNECTION_NAME,
) {
  if ((entity === null) || (entity === undefined)) {
    throw new CircularDependencyException('@InjectModel()');
  }
  const connectionPrefix = getConnectionPrefix(connection);
  return `${connectionPrefix}${entity.name}Repository`;
}

/**
 * This function returns a Connection injection token for the given SequelizeModuleOptions or connection name.
 * @param {SequelizeModuleOptions | string} [connection='default'] This optional parameter is either
 * a SequelizeModuleOptions or a string.
 * @returns {string | Function} The Connection injection token.
 */
export function getConnectionToken(
  connection: SequelizeModuleOptions | string = DEFAULT_CONNECTION_NAME,
): string | Function | Type<Sequelize> {
  return DEFAULT_CONNECTION_NAME === connection
    ? Sequelize
    : 'string' === typeof connection
    ? `${connection}Connection`
    : DEFAULT_CONNECTION_NAME === connection.name || !connection.name
    ? Sequelize
    : `${connection.name}Connection`;
}

/**
 * This function returns a Connection prefix based on the connection name
 * @param {SequelizeModuleOptions | string} [connection='default'] This optional parameter is either
 * a SequelizeModuleOptions or a string.
 * @returns {string | Function} The Connection injection token.
 */
export function getConnectionPrefix(
  connection: SequelizeModuleOptions | string = DEFAULT_CONNECTION_NAME,
): string {
  if (connection === DEFAULT_CONNECTION_NAME) {
    return '';
  }
  if (typeof connection === 'string') {
    return connection + '_';
  }
  if (connection.name === DEFAULT_CONNECTION_NAME || !connection.name) {
    return '';
  }
  return connection.name + '_';
}

export function handleRetry(
  retryAttempts = 9,
  retryDelay = 3000,
): <T>(source: Observable<T>) => Observable<T> {
  return <T>(source: Observable<T>) =>
    source.pipe(
      retryWhen(e =>
        e.pipe(
          scan((errorCount, error: Error) => {
            logger.error(
              `Unable to connect to the database. Retrying (${errorCount +
                1})...`,
              error.stack,
            );
            if (errorCount + 1 >= retryAttempts) {
              throw error;
            }
            return errorCount + 1;
          }, 0),
          delay(retryDelay),
        ),
      ),
    );
}

export function getConnectionName(options: SequelizeModuleOptions) {
  return options && options.name ? options.name : DEFAULT_CONNECTION_NAME;
}

export const generateString = () => uuid();
