import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
// import messages from '../messages/entity';
@Entity()
export default class users {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  user_name: string;

  @Column()
  user_age: string;
}
