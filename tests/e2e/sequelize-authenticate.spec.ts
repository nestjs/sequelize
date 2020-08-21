import { Test } from '@nestjs/testing';
import { ApplicationAuthenticateModule } from '../src/app-authenticate.module';
import { ConnectionRefusedError } from 'sequelize';

describe('Sequelize (authenticate)', () => {
  it(`should throw error`, async () => {
    const module = Test.createTestingModule({
      imports: [ApplicationAuthenticateModule],
    });

    await expect(module.compile()).rejects.toThrow(ConnectionRefusedError);
  });
});
