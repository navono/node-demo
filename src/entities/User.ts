import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { Base } from './Base';

@Entity()
export class User extends Base {
  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  password: string;

  @ApiProperty()
  @Column({
    nullable: true,
    type: 'text',
  })
  token?: string;

  @ApiProperty()
  @Column({
    nullable: true,
    type: 'text',
  })
  bio: string;
}
