import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export default class UserImage {
  // uuid generated when the image was initially uploaded to s3
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  // the bucket name for the given image - where it gets uploaded
  @Column({ type: 'varchar', length: '255', nullable: false })
  bucket: string;

  // the file slug for where the img is stored... in our case, /thumbnail/{thumbnail_id} or /images/{id}
  @Column({ type: 'varchar', length: '255', nullable: false })
  key: string;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  posting_date: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @UpdateDateColumn()
  edited_on: Date;

  // @OneToOne((type) => UserUpload)
  // userUpload: UserUpload;
}
