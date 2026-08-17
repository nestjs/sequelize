import { Injectable } from '@nestjs/common';
import { InjectModel } from '../../../lib/index.js';
import { Photo } from './photo.entity.js';

@Injectable()
export class PhotoService {
  constructor(
    @InjectModel(Photo, 'connection_2')
    private readonly photoRepository2: typeof Photo,
    @InjectModel(Photo)
    private readonly photoRepository: typeof Photo,
  ) {}

  async findAll(): Promise<Photo[]> {
    return await this.photoRepository.findAll();
  }

  async create(): Promise<Photo> {
    return this.photoRepository.create({
      name: 'Nest',
      description: 'Is great!',
      views: 6000,
    });
  }
}
