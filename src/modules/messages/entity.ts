import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import users from '../users/entity';

@Entity()
export default class messages {
  @PrimaryGeneratedColumn()
  message_id: number;

  @ManyToOne(() => users, (users) => users.user_id)
  @Column()
  user_id: number;

  @Column()
  message: string;

  @CreateDateColumn()
  posting_date: Date;
}
