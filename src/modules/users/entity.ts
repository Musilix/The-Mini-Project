import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class users {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  user_name: string;

  @Column()
  user_age: string;
}
