/*
  Warnings:

  - The values [UPI] on the enum `PaymentMode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMode_new" AS ENUM ('CASH', 'ONLINE', 'OTHER');
ALTER TABLE "PersonalTransaction" ALTER COLUMN "payment_mode" TYPE "PaymentMode_new" USING ("payment_mode"::text::"PaymentMode_new");
ALTER TYPE "PaymentMode" RENAME TO "PaymentMode_old";
ALTER TYPE "PaymentMode_new" RENAME TO "PaymentMode";
DROP TYPE "public"."PaymentMode_old";
COMMIT;
