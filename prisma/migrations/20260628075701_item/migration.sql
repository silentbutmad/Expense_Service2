/*
  Warnings:

  - You are about to drop the column `item_type` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "item_type";

-- DropEnum
DROP TYPE "ItemType";
