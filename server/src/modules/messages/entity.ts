import 'reflect-metadata';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
// import users from '../users/entity';
@Entity()
export default class messages {
  @PrimaryGeneratedColumn()
  message_id: number;

  @Column()
  user_id: number;

  @Column()
  message: string;

  @CreateDateColumn()
  posting_date: Date;
}
