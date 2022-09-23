import { MigrationInterface, QueryRunner } from "typeorm";

export class SwitchSoftDeletion1663967623874 implements MigrationInterface {
    name = 'SwitchSoftDeletion1663967623874'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "completelyRandomColumnForNoReason"`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "completelyRandomColumnForNoReason" character varying DEFAULT 'Yabba Dabba Donk'`);
    }

}
