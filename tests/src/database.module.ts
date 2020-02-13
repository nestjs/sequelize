import { DynamicModule, Module } from '@nestjs/common';
import { SequelizeModule } from '../../lib';
import { Photo } from './photo/photo.entity';

@Module({})
export class DatabaseModule {
  static async forRoot(): Promise<DynamicModule> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      module: DatabaseModule,
      imports: [
        SequelizeModule.forRoot({
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
      ],
    };
  }
}
