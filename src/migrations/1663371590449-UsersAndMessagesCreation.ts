import { MigrationInterface, QueryRunner } from "typeorm";

export class UsersAndMessagesCreation1663371590449 implements MigrationInterface {
    name = 'UsersAndMessagesCreation1663371590449'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" ADD "completelyRandomColumnForNoReason" character varying DEFAULT 'Yabba Dabba Donk'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "completelyRandomColumnForNoReason"`);
    }

}
