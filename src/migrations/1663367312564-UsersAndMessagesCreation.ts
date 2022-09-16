import { MigrationInterface, QueryRunner } from "typeorm";

export class UsersAndMessagesCreation1663367312564 implements MigrationInterface {
    name = 'UsersAndMessagesCreation1663367312564'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "fk_user"`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "completelyRandomColumnForNoReason" character varying DEFAULT 'Yabba Dabba Donk'`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "posting_date" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_830a3c1d92614d1495418c46736" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_830a3c1d92614d1495418c46736"`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "posting_date" SET DEFAULT CURRENT_DATE`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "completelyRandomColumnForNoReason"`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
