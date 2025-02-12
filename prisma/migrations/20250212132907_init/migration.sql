/*
  Warnings:

  - You are about to drop the column `experienceLevel` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `goals` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `learningStyle` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `timeCommitment` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "experienceLevel",
DROP COLUMN "goals",
DROP COLUMN "learningStyle",
DROP COLUMN "level",
DROP COLUMN "timeCommitment";
