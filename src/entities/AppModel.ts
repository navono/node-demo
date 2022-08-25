import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany } from 'typeorm';
import { Base } from './Base';
import { Pic } from './Pic';

@Entity()
export class AppModel extends Base {
  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ type: 'text', default: '' })
  description: string;

  @ApiProperty()
  @Column({ default: '' })
  category: string;

  @OneToMany(() => Pic, (pic) => pic.model)
  pics: Pic[];
}
