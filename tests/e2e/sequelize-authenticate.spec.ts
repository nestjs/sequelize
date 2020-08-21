import { Test } from '@nestjs/testing';
import { ConnectionRefusedError } from 'sequelize';
import { ApplicationAuthenticateModule } from '../src/app-authenticate.module';

describe('Sequelize (authenticate)', () => {
  it(`should throw error`, async () => {
    const module = Test.createTestingModule({
      imports: [ApplicationAuthenticateModule],
    });
    try {
      await module.compile();
    } catch (err) {
      expect(err).toBeInstanceOf(ConnectionRefusedError);
    }
  });
});
