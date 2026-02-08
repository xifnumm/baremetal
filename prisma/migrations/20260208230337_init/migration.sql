-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('RETAIL', 'INSTITUTIONAL');

-- CreateEnum
CREATE TYPE "StorageType" AS ENUM ('ALLOCATED', 'UNALLOCATED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ClientType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deposits" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "depositNumber" TEXT NOT NULL,
    "metalType" TEXT NOT NULL,
    "storageType" "StorageType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "remainingQuantity" DOUBLE PRECISION NOT NULL,
    "barSerial" TEXT,
    "depositedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawals" (
    "id" TEXT NOT NULL,
    "accountID" TEXT NOT NULL,
    "withdrawalNumber" TEXT NOT NULL,
    "depositId" TEXT,
    "barSerial" TEXT,
    "storageType" "StorageType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "withdrawnAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metalType" TEXT NOT NULL,

    CONSTRAINT "Withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Deposits_depositNumber_key" ON "Deposits"("depositNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Deposits_barSerial_key" ON "Deposits"("barSerial");

-- CreateIndex
CREATE UNIQUE INDEX "Withdrawals_withdrawalNumber_key" ON "Withdrawals"("withdrawalNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Withdrawals_barSerial_key" ON "Withdrawals"("barSerial");

-- AddForeignKey
ALTER TABLE "Deposits" ADD CONSTRAINT "Deposits_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawals" ADD CONSTRAINT "Withdrawals_accountID_fkey" FOREIGN KEY ("accountID") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawals" ADD CONSTRAINT "Withdrawals_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "Deposits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
