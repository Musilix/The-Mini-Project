import 'reflect-metadata';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import users from '../users/entity';

// import users from '../users/entity';
@Entity()
export default class messages {
  @PrimaryGeneratedColumn({ type: 'integer' })
  message_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  message: string;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  posting_date: Date;

  @ManyToOne(() => users, (users) => users.messages, {
    eager: false,
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'user_id' }])
  user: users;

  @DeleteDateColumn()
  deleted_at: Date;

  @UpdateDateColumn()
  edited_on: Date;

  // We can add a new, non-nullable field to our entity if we already have data in the table - as each of the existing rows in the table would set this field as null, causing an error
  // Instead, we have to set it as nullable, run the migration for the newly added field, change it back to non-nullable, and then run the migration again thereafter...?
  // @Column({ nullable: true, default: 'Yabba Dabba Donk' })
  // completelyRandomColumnForNoReason: string;
}
