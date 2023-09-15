/*
  Warnings:

  - You are about to drop the `Promp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Promp";

-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "template" TEXT NOT NULL,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);
