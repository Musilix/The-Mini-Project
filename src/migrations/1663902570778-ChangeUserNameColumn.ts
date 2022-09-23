import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeUserNameColumn1663902570778 implements MigrationInterface {
    name = 'ChangeUserNameColumn1663902570778'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "user_name" TO "username"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "username" TO "user_name"`);
    }

}
