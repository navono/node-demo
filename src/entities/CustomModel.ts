// 自定义模型。内容为流程图的图元存档
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { Base } from './Base';

@Entity()
export class CustomModel extends Base {
  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({
    type: 'text',
  })
  data: string;

  @ApiProperty()
  @Column({
    type: 'text',
  })
  preview: string;

  @ApiProperty()
  @Column({
    nullable: true,
    type: 'text',
  })
  ext?: string;
}
