-- CreateEnum
CREATE TYPE "PersonalTransactionType" AS ENUM ('EXPENSE', 'INCOME', 'LOAN');

-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('BORROW', 'LENT');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'UPI', 'OTHER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SALE', 'EXPENSE', 'PURCHASE');

-- CreateEnum
CREATE TYPE "PartyType" AS ENUM ('CUSTOMER', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "ReminderChannel" AS ENUM ('SMS', 'EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('PRODUCT', 'EXPENSE');

-- CreateEnum
CREATE TYPE "ExpenseContextType" AS ENUM ('PERSONAL', 'BUSINESS');

-- CreateTable
CREATE TABLE "PersonalTransaction" (
    "transaction_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "transaction_type" "PersonalTransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "category" TEXT,
    "remark" TEXT,
    "payment_mode" "PaymentMode" NOT NULL,
    "loan_type" "LoanType",
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PersonalTransaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "Business" (
    "business_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "business_name" TEXT NOT NULL,
    "gst_number" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("business_id")
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "category_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_id" UUID NOT NULL,
    "category_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "Party" (
    "party_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "party_type" "PartyType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("party_id")
);

-- CreateTable
CREATE TABLE "Item" (
    "item_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_id" UUID NOT NULL,
    "category_id" UUID,
    "name" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "unit" TEXT,
    "gst_rate" DECIMAL(5,2),
    "hsn_code" TEXT,
    "item_type" "ItemType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "transaction_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transaction_number" TEXT NOT NULL,
    "context_type" "ExpenseContextType" NOT NULL DEFAULT 'BUSINESS',
    "business_id" UUID,
    "party_id" UUID,
    "user_id" UUID,
    "transaction_type" "TransactionType" NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3),
    "subtotal_amount" DECIMAL(15,2) NOT NULL,
    "total_gst_amount" DECIMAL(15,2) NOT NULL,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "device_id" TEXT,
    "last_modified_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID NOT NULL,
    "updated_by_user_id" UUID,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "TransactionItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transaction_id" UUID NOT NULL,
    "item_id" UUID,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "TransactionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "reminder_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transaction_id" UUID NOT NULL,
    "channel" "ReminderChannel" NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "last_sent_at" TIMESTAMP(3),

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("reminder_id")
);

-- CreateIndex
CREATE INDEX "PersonalTransaction_user_id_idx" ON "PersonalTransaction"("user_id");

-- CreateIndex
CREATE INDEX "Business_user_id_idx" ON "Business"("user_id");

-- CreateIndex
CREATE INDEX "ExpenseCategory_business_id_idx" ON "ExpenseCategory"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_business_id_category_name_key" ON "ExpenseCategory"("business_id", "category_name");

-- CreateIndex
CREATE INDEX "Party_business_id_idx" ON "Party"("business_id");

-- CreateIndex
CREATE INDEX "Item_business_id_idx" ON "Item"("business_id");

-- CreateIndex
CREATE INDEX "Item_category_id_idx" ON "Item"("category_id");

-- CreateIndex
CREATE INDEX "Transaction_business_id_idx" ON "Transaction"("business_id");

-- CreateIndex
CREATE INDEX "Transaction_party_id_idx" ON "Transaction"("party_id");

-- CreateIndex
CREATE INDEX "Transaction_user_id_idx" ON "Transaction"("user_id");

-- CreateIndex
CREATE INDEX "Transaction_business_id_transaction_date_idx" ON "Transaction"("business_id", "transaction_date");

-- CreateIndex
CREATE INDEX "Transaction_business_id_is_deleted_idx" ON "Transaction"("business_id", "is_deleted");

-- CreateIndex
CREATE INDEX "Transaction_context_type_idx" ON "Transaction"("context_type");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_business_id_transaction_number_key" ON "Transaction"("business_id", "transaction_number");

-- CreateIndex
CREATE INDEX "TransactionItem_transaction_id_idx" ON "TransactionItem"("transaction_id");

-- CreateIndex
CREATE INDEX "TransactionItem_item_id_idx" ON "TransactionItem"("item_id");

-- CreateIndex
CREATE INDEX "Reminder_transaction_id_idx" ON "Reminder"("transaction_id");

-- CreateIndex
CREATE INDEX "Reminder_scheduled_date_idx" ON "Reminder"("scheduled_date");

-- AddForeignKey
ALTER TABLE "ExpenseCategory" ADD CONSTRAINT "ExpenseCategory_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ExpenseCategory"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "Party"("party_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("transaction_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("item_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("transaction_id") ON DELETE CASCADE ON UPDATE CASCADE;
