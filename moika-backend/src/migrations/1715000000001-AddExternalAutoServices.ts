import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExternalAutoServices1715000000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "external_auto_services" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "placeId" character varying UNIQUE NOT NULL,
        "name" character varying NOT NULL,
        "address" character varying NOT NULL,
        "lat" decimal(10,7) NOT NULL,
        "lng" decimal(10,7) NOT NULL,
        "rating" decimal(2,1),
        "userRatingsTotal" integer,
        "types" text,
        "phone" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "external_auto_services"');
  }
}
