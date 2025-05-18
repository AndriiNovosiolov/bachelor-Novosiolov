import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCarSizeAndSupportedSizes1715000000004
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Додаємо поле size у user_cars
    await queryRunner.query(`
      ALTER TABLE "user_cars" ADD COLUMN "size" character varying NOT NULL DEFAULT 'sedan';
    `);
    // Додаємо поле supportedSizes у car_washes
    await queryRunner.query(`
      ALTER TABLE "car_washes" ADD COLUMN "supportedSizes" text[] DEFAULT '{sedan,suv,micro,minivan,pickup,other}';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "user_cars" DROP COLUMN IF EXISTS "size"',
    );
    await queryRunner.query(
      'ALTER TABLE "car_washes" DROP COLUMN IF EXISTS "supportedSizes"',
    );
  }
}
