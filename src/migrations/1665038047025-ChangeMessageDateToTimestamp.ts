import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeMessageDateToTimestamp1665038047025 implements MigrationInterface {
    name = 'ChangeMessageDateToTimestamp1665038047025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" ADD COLUMN "posting_date_temp" TIMESTAMP without time zone NULL`);
        await queryRunner.query(`UPDATE "messages" SET "posting_date_temp"  = posting_date::TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "posting_date" TYPE TIMESTAMP without time zone USING "posting_date_temp"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN posting_date_temp`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" ADD COLUMN "posting_date_temp" DATE NULL`);
        await queryRunner.query(`UPDATE "messages" SET "posting_date_temp"  = posting_date::DATE`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "posting_date" TYPE DATE USING "posting_date_temp"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN posting_date_temp`);
    }

}
