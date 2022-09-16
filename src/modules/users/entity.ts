import 'reflect-metadata';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import messages from '../messages/entity';
@Entity()
export default class users {
  @PrimaryGeneratedColumn({ type: 'integer' })
  user_id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false, default: 'Anon' })
  user_name: string;

  @Column({ type: 'varchar', length: 3, nullable: true })
  user_age: string;

  @OneToMany(() => messages, (messages) => messages.user)
  messages: messages[];
}
