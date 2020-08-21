import { Module } from '@nestjs/common';
import { SequelizeModule } from '../../lib';

@Module({
  imports: [
    SequelizeModule.forRoot({
      database: 'test',
      dialect: 'postgres',
      logging: false,
      username: 'root',
      password: 'root',
      host: '0.0.0.0',
      port: 3307, // incorrect port to force an connection error
      synchronize: false, // must be false because sync try to connect
      autoLoadModels: true,
      retryAttempts: 0,
      retryDelay: 1000,
    }),
  ],
})
export class ApplicationAuthenticateModule {}
