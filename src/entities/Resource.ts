import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { Base } from './Base';

@Entity()
export class Resource extends Base {
  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({
    nullable: true,
  })
  description: string;

  @ApiProperty()
  @Column()
  preset: boolean;

  @ApiProperty()
  @Column()
  category: string;

  @ApiProperty()
  @Column({
    nullable: true,
  })
  subFolder?: string;

  @ApiProperty()
  @Column({
    nullable: true,
  })
  diskPath?: string;

  @ApiProperty()
  @Column({
    nullable: true,
  })
  urlPath?: string;

  @ApiProperty()
  @Column({
    nullable: true,
    type: 'text',
  })
  ext?: string;
}
