import { Module } from '@nestjs/common';
import { SequelizeModule } from '../../lib';
import { Photo } from './photo/photo.entity';
import { PhotoModule } from './photo/photo.module';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        dialect: 'postgres',
        logging: false,
        host: '0.0.0.0',
        port: 3306,
        username: 'root',
        password: 'root',
        database: 'test',
        models: [Photo],
        synchronize: true,
        retryAttempts: 2,
        retryDelay: 1000,
        repositoryMode: true,
      }),
    }),
    SequelizeModule.forRoot({
      name: 'connection_2',
      dialect: 'postgres',
      logging: false,
      host: '0.0.0.0',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      repositoryMode: true,
      models: [Photo],
      synchronize: true,
      retryAttempts: 2,
      retryDelay: 1000,
    }),
    PhotoModule,
  ],
})
export class AsyncOptionsFactoryModule {}
