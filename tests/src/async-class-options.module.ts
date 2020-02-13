import { Module } from '@nestjs/common';
import {
  SequelizeModule,
  SequelizeModuleOptions,
  SequelizeOptionsFactory,
} from '../../lib';
import { Photo } from './photo/photo.entity';
import { PhotoModule } from './photo/photo.module';

class ConfigService implements SequelizeOptionsFactory {
  createSequelizeOptions(): SequelizeModuleOptions {
    return {
      dialect: 'postgres',
      logging: false,
      host: '0.0.0.0',
      port: 3306,
      username: 'root',
      autoLoadModels: true,
      password: 'root',
      database: 'test',
      synchronize: true,
      retryAttempts: 2,
      retryDelay: 1000,
    };
  }
}

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useClass: ConfigService,
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
      models: [Photo],
      synchronize: true,
      retryAttempts: 2,
      retryDelay: 1000,
    }),
    PhotoModule,
  ],
})
export class AsyncOptionsClassModule {}
