import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import UserImage from '../UserImage/entity';

@Entity()
export default class UserUpload {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  // FK to a row in the UserImage table
  /* No need for 2nd callback, as we dont need bidirectional relation... images dont need to know what uploads their in
  /* @OneToOne((type) => UserImage, (userImage) => userImage.id) 
  */

  @OneToOne(() => UserImage)
  @JoinColumn({ name: 'image_id' })
  //  No need to define type, inherent type of FK here points to UUID PK of UserImage type
  // @Column({ type: 'uuid', nullable: false })
  image_id: string;

  // another FK to a row in the UserImage table
  @OneToOne(() => UserImage)
  @JoinColumn({ name: 'thumbnail_id' })
  thumbnail_id: UserImage;

  @Column({ type: 'varchar', length: '255', nullable: false })
  file_name: string;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  posting_date: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @UpdateDateColumn()
  edited_on: Date;
}
