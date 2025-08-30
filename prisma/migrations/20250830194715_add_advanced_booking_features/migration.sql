/*
  Warnings:

  - You are about to drop the column `email` on the `WaitingList` table. All the data in the column will be lost.
  - You are about to drop the column `flexible` on the `WaitingList` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `WaitingList` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `WaitingList` table. All the data in the column will be lost.
  - You are about to drop the column `preferredTime` on the `WaitingList` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `WaitingList` table. All the data in the column will be lost.
  - Added the required column `customerEmail` to the `WaitingList` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "GroupBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxSize" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupBooking_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecurringBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "timeSlot" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecurringBooking_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecurringBooking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecurringBooking_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StaffPortfolio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "category" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StaffPortfolio_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StaffPortfolio_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "createdBy" TEXT,
    "cancelledBy" TEXT,
    "groupBookingId" TEXT,
    "recurringBookingId" TEXT,
    CONSTRAINT "Booking_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_groupBookingId_fkey" FOREIGN KEY ("groupBookingId") REFERENCES "GroupBooking" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_recurringBookingId_fkey" FOREIGN KEY ("recurringBookingId") REFERENCES "RecurringBooking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("cancelledBy", "createdBy", "customerEmail", "endAt", "id", "serviceId", "staffId", "startAt", "status", "tenantId") SELECT "cancelledBy", "createdBy", "customerEmail", "endAt", "id", "serviceId", "staffId", "startAt", "status", "tenantId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE INDEX "Booking_tenantId_staffId_startAt_idx" ON "Booking"("tenantId", "staffId", "startAt");
CREATE TABLE "new_WaitingList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "staffId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "preferredDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaitingList_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WaitingList_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WaitingList_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WaitingList" ("createdAt", "id", "preferredDate", "serviceId", "tenantId") SELECT "createdAt", "id", "preferredDate", "serviceId", "tenantId" FROM "WaitingList";
DROP TABLE "WaitingList";
ALTER TABLE "new_WaitingList" RENAME TO "WaitingList";
CREATE INDEX "WaitingList_tenantId_serviceId_preferredDate_idx" ON "WaitingList"("tenantId", "serviceId", "preferredDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
