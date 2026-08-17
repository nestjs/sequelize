import { Module } from '@nestjs/common';
import { SequelizeModule } from '../../../lib/index.js';
import { PhotoController } from './photo.controller.js';
import { Photo } from './photo.entity.js';
import { PhotoService } from './photo.service.js';

@Module({
  imports: [
    SequelizeModule.forFeature([Photo]),
    SequelizeModule.forFeature([Photo], 'connection_2'),
  ],
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
