import { Logger, Type } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';
import { delay, retryWhen, scan } from 'rxjs/operators';
import { Sequelize } from 'sequelize-typescript';
import { CircularDependencyException } from '../exceptions/circular-dependency.exception.js';
import { SequelizeModuleOptions } from '../interfaces/index.js';
import { DEFAULT_CONNECTION_NAME } from '../sequelize.constants.js';

const logger = new Logger('SequelizeModule');

/**
 * This function generates an injection token for a model
 * @param {Function} entity The model class
 * @param {string} [connection='default'] Connection name
 * @returns {string} The model injection token
 *
 * @publicApi
 */
export function getModelToken(
  entity: Function,
  connection: SequelizeModuleOptions | string = DEFAULT_CONNECTION_NAME,
) {
  if (entity === null || entity === undefined) {
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
 *
 * @publicApi
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
 *
 * @publicApi
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

const DEFAULT_RETRY_ATTEMPTS = 10;
const DEFAULT_RETRY_DELAY = 3000;

export function handleRetry(
  retryAttempts = DEFAULT_RETRY_ATTEMPTS,
  retryDelay = DEFAULT_RETRY_DELAY,
): <T>(source: Observable<T>) => Observable<T> {
  // A limit that is not a number, such as the NaN that `Number()` makes of an
  // unset environment variable, gets its default: no comparison is true for
  // NaN, so the attempts would never run out, and a delay of NaN doesn't wait
  // at all. Infinity still retries forever.
  if (isNaN(retryAttempts)) {
    retryAttempts = DEFAULT_RETRY_ATTEMPTS;
  }
  if (isNaN(retryDelay)) {
    retryDelay = DEFAULT_RETRY_DELAY;
  }
  return <T>(source: Observable<T>) =>
    source.pipe(
      retryWhen((e) =>
        e.pipe(
          scan((errorCount, error: Error) => {
            const isLastAttempt = errorCount + 1 >= retryAttempts;
            const retryMessage = isLastAttempt
              ? ''
              : ` Retrying (${errorCount + 1})...`;

            logger.error(
              `Unable to connect to the database.${retryMessage}`,
              error.stack,
            );
            if (isLastAttempt) {
              throw error;
            }
            return errorCount + 1;
          }, 0),
          delay(retryDelay),
        ),
      ),
    );
}

/**
 * @publicApi
 */
export function getConnectionName(options: SequelizeModuleOptions) {
  return options && options.name ? options.name : DEFAULT_CONNECTION_NAME;
}

export const generateString = () => randomUUID();
