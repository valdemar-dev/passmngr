/*
  Warnings:

  - You are about to drop the column `name` on the `Account` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT,
    "username" TEXT,
    "password" TEXT NOT NULL
);
INSERT INTO "new_Account" ("email", "id", "password") SELECT "email", "id", "password" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
