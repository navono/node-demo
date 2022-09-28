import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class Base {
  @ApiProperty()
  @Column({
    primary: true,
    unique: true,
  })
  id: string;

  @CreateDateColumn({ name: 'create_at', nullable: true })
  createAt: Date;

  @UpdateDateColumn({
    name: 'update_at',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updateAt: Date;
}
