import 'reflect-metadata';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import messages from '../messages/entity';
@Entity()
export default class users {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  user_name: string;

  @Column()
  user_age: string;

  @OneToMany(() => messages, (messages) => messages.user)
  messages: messages[];
}
