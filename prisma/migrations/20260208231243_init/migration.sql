/*
  Warnings:

  - You are about to drop the column `accountID` on the `Withdrawals` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `Withdrawals` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Withdrawals" DROP CONSTRAINT "Withdrawals_accountID_fkey";

-- AlterTable
ALTER TABLE "Withdrawals" DROP COLUMN "accountID",
ADD COLUMN     "accountId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Withdrawals" ADD CONSTRAINT "Withdrawals_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
