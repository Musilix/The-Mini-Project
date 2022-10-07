import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedDeleteNameAndAddEditCol1665102418396 implements MigrationInterface {
    name = 'ChangedDeleteNameAndAddEditCol1665102418396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" RENAME COLUMN "deletedAt" to "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "edited_on" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`UPDATE "messages" SET "edited_on" = "posting_date"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" RENAME COLUMN "deleted_at" to "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "edited_on"`);
    }

}
