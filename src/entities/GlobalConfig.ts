import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { Base } from './Base';

@Entity()
export class GlobalConfig extends Base {
  @ApiProperty()
  @Column({ unique: true })
  name: string;

  @ApiProperty()
  @Column({ type: 'text', default: '' })
  value: string;
}
