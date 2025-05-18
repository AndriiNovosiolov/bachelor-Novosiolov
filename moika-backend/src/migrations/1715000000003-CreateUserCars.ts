import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserCars1715000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_cars" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "userId" uuid NOT NULL,
        "brand" character varying NOT NULL,
        "model" character varying NOT NULL,
        "year" integer NOT NULL,
        "engineType" character varying NOT NULL,
        "mileage" integer NOT NULL,
        "serviceFrequency" integer NOT NULL,
        "lastOilChangeDate" TIMESTAMP,
        "lastDiagnosticsDate" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_user_cars_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "user_cars"');
  }
}
