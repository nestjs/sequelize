import { Module } from '@nestjs/common';
import { SequelizeModule } from '../../lib/index.js';
import { PhotoModule } from './photo/photo.module.js';

@Module({
  imports: [
    SequelizeModule.forRoot({
      database: 'test',
      dialect: 'postgres',
      logging: false,
      username: 'root',
      password: 'root',
      host: '0.0.0.0',
      port: 3306,
      synchronize: true,
      autoLoadModels: true,
      retryAttempts: 2,
      retryDelay: 1000,
    }),
    PhotoModule,
    SequelizeModule.forRoot({
      name: 'connection_2',
      dialect: 'postgres',
      logging: false,
      host: '0.0.0.0',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      synchronize: true,
      autoLoadModels: true,
      retryAttempts: 2,
      retryDelay: 1000,
    }),
  ],
})
export class ApplicationModule {}
