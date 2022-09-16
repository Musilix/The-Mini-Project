import { MigrationInterface, QueryRunner } from "typeorm";

export class UsersAndMessagesCreation1663362940625 implements MigrationInterface {
    name = 'UsersAndMessagesCreation1663362940625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "fk_user"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_name"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "user_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_age"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "user_age" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "message"`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "message" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "posting_date"`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "posting_date" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_830a3c1d92614d1495418c46736" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_830a3c1d92614d1495418c46736"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "posting_date"`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "posting_date" date NOT NULL DEFAULT CURRENT_DATE`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "message"`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "message" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_age"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "user_age" character varying(3)`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_name"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "user_name" character varying(255) NOT NULL DEFAULT 'Anon'`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
