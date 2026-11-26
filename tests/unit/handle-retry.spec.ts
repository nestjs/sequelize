import { Logger } from '@nestjs/common';
import { defer, lastValueFrom, throwError } from 'rxjs';
import { handleRetry } from '../../lib/common/sequelize.utils.js';

describe('handleRetry', () => {
  let attempts: number;
  const failingConnection = defer(() => {
    attempts++;
    return throwError(() => new Error(`attempt ${attempts} failed`));
  });

  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    attempts = 0;
    errorSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not announce a retry after the last attempt', async () => {
    await expect(
      lastValueFrom(failingConnection.pipe(handleRetry(3, 0))),
    ).rejects.toThrow('attempt 3 failed');
    const messages = errorSpy.mock.calls.map((args: unknown[]) => args[0]);
    expect(messages).toEqual([
      'Unable to connect to the database. Retrying (1)...',
      'Unable to connect to the database. Retrying (2)...',
      'Unable to connect to the database.',
    ]);
  });

  it('does not announce a retry when retryAttempts is 0', async () => {
    await expect(
      lastValueFrom(failingConnection.pipe(handleRetry(0, 0))),
    ).rejects.toThrow('attempt 1 failed');
    const messages = errorSpy.mock.calls.map((args: unknown[]) => args[0]);
    expect(messages).toEqual(['Unable to connect to the database.']);
  });
});
