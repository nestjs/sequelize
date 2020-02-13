import { Module } from '@nestjs/common';
import {
  SequelizeModule,
  SequelizeModuleOptions,
  SequelizeOptionsFactory,
} from '../../lib';
import { PhotoModule } from './photo/photo.module';

class ConfigService implements SequelizeOptionsFactory {
  createSequelizeOptions(): SequelizeModuleOptions {
    return {
      dialect: 'postgres',
      logging: false,
      host: '0.0.0.0',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      synchronize: true,
      retryAttempts: 2,
      retryDelay: 1000,
    };
  }
}

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
class ConfigModule {}

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useExisting: ConfigService,
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
      models: [],
      autoLoadModels: true,
      synchronize: true,
      retryAttempts: 2,
      retryDelay: 1000,
    }),
    PhotoModule,
  ],
})
export class AsyncOptionsExistingModule {}
