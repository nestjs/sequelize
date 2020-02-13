import { Module } from '@nestjs/common';
import { SequelizeModule } from '../../../lib';
import { PhotoController } from './photo.controller';
import { Photo } from './photo.entity';
import { PhotoService } from './photo.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Photo]),
    SequelizeModule.forFeature([Photo], 'connection_2'),
  ],
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
