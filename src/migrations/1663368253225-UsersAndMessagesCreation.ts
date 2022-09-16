import { MigrationInterface, QueryRunner } from "typeorm";

export class UsersAndMessagesCreation1663368253225 implements MigrationInterface {
    name = 'UsersAndMessagesCreation1663368253225'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "completelyRandomColumnForNoReason"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" ADD "completelyRandomColumnForNoReason" character varying DEFAULT 'Yabba Dabba Donk'`);
    }

}
