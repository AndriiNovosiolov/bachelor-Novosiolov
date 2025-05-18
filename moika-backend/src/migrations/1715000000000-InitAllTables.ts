import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAllTables1715000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // User role enum
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('customer', 'owner');
    `);

    // Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "email" character varying NOT NULL UNIQUE,
        "password" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "role" user_role_enum NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // Car washes table
    await queryRunner.query(`
      CREATE TABLE "car_washes" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "ownerId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "address" character varying NOT NULL,
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "photos" text[] DEFAULT '{}',
        "city" character varying NOT NULL,
        "latitude" decimal(10,7) NOT NULL,
        "longitude" decimal(10,7) NOT NULL,
        "workingHours" jsonb NOT NULL,
        "phone" character varying NOT NULL,
        "website" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_car_washes_owner" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Services table
    await queryRunner.query(`
      CREATE TABLE "services" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "carWashId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "description" text NOT NULL,
        "durationMinutes" integer NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_services_car_wash" FOREIGN KEY ("carWashId") REFERENCES "car_washes"("id") ON DELETE CASCADE
      );
    `);

    // Booking status enum
    await queryRunner.query(`
      CREATE TYPE "booking_status_enum" AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
    `);

    // Bookings table
    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "userId" uuid NOT NULL,
        "carWashId" uuid NOT NULL,
        "serviceId" uuid NOT NULL,
        "startTime" TIMESTAMP NOT NULL,
        "endTime" TIMESTAMP NOT NULL,
        "totalPrice" decimal(10,2) NOT NULL,
        "status" booking_status_enum NOT NULL DEFAULT 'pending',
        "notes" text,
        "reminderSent" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_bookings_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_bookings_car_wash" FOREIGN KEY ("carWashId") REFERENCES "car_washes"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_bookings_service" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE
      );
    `);

    // Reviews table
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "userId" uuid NOT NULL,
        "carWashId" uuid NOT NULL,
        "rating" integer NOT NULL,
        "comment" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_reviews_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reviews_car_wash" FOREIGN KEY ("carWashId") REFERENCES "car_washes"("id") ON DELETE CASCADE
      );
    `);

    // Service type enum
    await queryRunner.query(`
      CREATE TYPE "service_type_enum" AS ENUM ('oil_change', 'polishing', 'chemical_cleaning', 'diagnostics', 'tire_service', 'other');
    `);

    // Request status enum
    await queryRunner.query(`
      CREATE TYPE "request_status_enum" AS ENUM ('pending', 'accepted', 'rejected', 'completed');
    `);

    // Auto services table
    await queryRunner.query(`
      CREATE TABLE "auto_services" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "name" character varying NOT NULL,
        "description" text,
        "type" service_type_enum NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "durationMinutes" integer NOT NULL,
        "carWashId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_auto_services_car_wash" FOREIGN KEY ("carWashId") REFERENCES "car_washes"("id") ON DELETE CASCADE
      );
    `);

    // Service requests table
    await queryRunner.query(`
      CREATE TABLE "service_requests" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "userId" uuid NOT NULL,
        "carWashId" uuid NOT NULL,
        "type" service_type_enum NOT NULL,
        "description" text NOT NULL,
        "status" request_status_enum NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_service_requests_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_service_requests_car_wash" FOREIGN KEY ("carWashId") REFERENCES "car_washes"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "service_requests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auto_services"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bookings"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "booking_status_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "services"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "car_washes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "service_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "request_status_enum"`);
  }
}
