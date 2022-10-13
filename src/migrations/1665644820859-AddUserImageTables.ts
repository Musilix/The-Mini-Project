import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserImageTables1665644820859 implements MigrationInterface {
    name = 'AddUserImageTables1665644820859'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_image" ("id" uuid NOT NULL, "bucket" character varying(255) NOT NULL, "key" character varying(255) NOT NULL, "posting_date" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "edited_on" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4f776c999cfa0294c3c11876c71" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_upload" ("id" SERIAL NOT NULL, "file_name" character varying(255) NOT NULL, "posting_date" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "edited_on" TIMESTAMP NOT NULL DEFAULT now(), "image_id" uuid, "thumbnail_id" uuid, CONSTRAINT "REL_4b81ede441e2fb29bf6658bf19" UNIQUE ("image_id"), CONSTRAINT "REL_a187ec0b962bc552e87b4763f1" UNIQUE ("thumbnail_id"), CONSTRAINT "PK_17b2b744dc90f6b230656f4f26d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_upload" ADD CONSTRAINT "FK_4b81ede441e2fb29bf6658bf19d" FOREIGN KEY ("image_id") REFERENCES "user_image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_upload" ADD CONSTRAINT "FK_a187ec0b962bc552e87b4763f17" FOREIGN KEY ("thumbnail_id") REFERENCES "user_image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_upload" DROP CONSTRAINT "FK_a187ec0b962bc552e87b4763f17"`);
        await queryRunner.query(`ALTER TABLE "user_upload" DROP CONSTRAINT "FK_4b81ede441e2fb29bf6658bf19d"`);
        await queryRunner.query(`DROP TABLE "user_upload"`);
        await queryRunner.query(`DROP TABLE "user_image"`);
    }

}
