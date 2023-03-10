/*
  Warnings:

  - You are about to drop the column `authKey` on the `User` table. All the data in the column will be lost.
  - Added the required column `application` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "application" TEXT NOT NULL,
    "vaultId" INTEGER NOT NULL,
    "iv" TEXT NOT NULL,
    CONSTRAINT "Account_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("email", "id", "iv", "password", "username", "vaultId") SELECT "email", "id", "iv", "password", "username", "vaultId" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL
);
INSERT INTO "new_User" ("email", "id", "sessionToken") SELECT "email", "id", "sessionToken" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_sessionToken_key" ON "User"("sessionToken");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
