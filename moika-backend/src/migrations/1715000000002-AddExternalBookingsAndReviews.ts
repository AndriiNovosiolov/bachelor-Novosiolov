import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExternalBookingsAndReviews1715000000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Таблиця бронювань для external_auto_services
    await queryRunner.query(`
      CREATE TABLE "external_auto_service_bookings" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "externalAutoServiceId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "serviceType" character varying NOT NULL,
        "startTime" TIMESTAMP NOT NULL,
        "endTime" TIMESTAMP NOT NULL,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_external_booking_service" FOREIGN KEY ("externalAutoServiceId") REFERENCES "external_auto_services"("id") ON DELETE CASCADE
      );
    `);

    // Таблиця відгуків для external_auto_services
    await queryRunner.query(`
      CREATE TABLE "external_auto_service_reviews" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "externalAutoServiceId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "serviceType" character varying NOT NULL,
        "rating" integer NOT NULL,
        "comment" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_external_review_service" FOREIGN KEY ("externalAutoServiceId") REFERENCES "external_auto_services"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TABLE IF EXISTS "external_auto_service_reviews"',
    );
    await queryRunner.query(
      'DROP TABLE IF EXISTS "external_auto_service_bookings"',
    );
  }
}
