import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({})
export class Photo extends Model {
  @Column
  name!: string;

  @Column
  description!: string;

  @Column
  filename!: string;

  @Column
  views!: number;

  @Column(DataType.BOOLEAN)
  isPublished!: boolean;
}
